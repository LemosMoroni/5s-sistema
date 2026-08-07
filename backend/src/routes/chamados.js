import { Router } from "express";
import { pool } from "../db/index.js";
import { aplicarPontuacao } from "../db/pontuacao.js";

export const chamadosRouter = Router();

const selectBase = `
  SELECT c.*, s.nome as senso_nome, s.pontos_nao_conformidade, s.recuperavel,
         b.nome as bloco_origem_nome, u.nome as criado_por_nome
  FROM chamados c
  JOIN sensos s ON s.id = c.senso_id
  JOIN blocos b ON b.id = c.bloco_origem_id
  JOIN usuarios u ON u.id = c.criado_por
`;

// RF07 — mural geral visível a todas as equipes
chamadosRouter.get("/", async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = selectBase;
    const params = [];
    if (status) {
      params.push(status);
      query += ` WHERE c.status = $${params.length}`;
    }
    query += " ORDER BY c.criado_em DESC";
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// RF05/RF06 — Líder ou Coordenador cadastra chamado; a perda de pontos do bloco
// de origem é aplicada imediatamente (regra provisória — ver RN08 e TODO abaixo)
chamadosRouter.post("/", async (req, res, next) => {
  try {
    const { titulo, descricao, sensoId, local, evidenciaUrl, criadoPorId, blocoOrigemId, prazoDias } =
      req.body;

    const { rows: criadorRows } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      criadoPorId,
    ]);
    const criador = criadorRows[0];
    if (!criador || !["coordenador", "lider"].includes(criador.papel)) {
      return res.status(403).json({ erro: "Apenas Líder ou Coordenador podem abrir chamados" });
    }

    const { rows: sensoRows } = await pool.query("SELECT * FROM sensos WHERE id = $1", [sensoId]);
    const senso = sensoRows[0];
    if (!senso) return res.status(400).json({ erro: "Senso inválido" });

    const { rows } = await pool.query(
      `INSERT INTO chamados
       (titulo, descricao, senso_id, local, evidencia_url, criado_por, bloco_origem_id, prazo_dias, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'aberto')
       RETURNING id`,
      [
        titulo,
        descricao,
        sensoId,
        local ?? null,
        evidenciaUrl ?? null,
        criadoPorId,
        blocoOrigemId,
        prazoDias ?? 7, // TODO: validar prazo padrão ("tempo hábil") com a coordenação
      ]
    );
    const chamadoId = rows[0].id;

    // Desconta os pontos do time do bloco de origem assim que a não conformidade é registrada.
    // Se for resolvida a tempo (RN05), os pontos recuperáveis retornam via rota /resolver.
    const { rows: timeRows } = await pool.query("SELECT * FROM times WHERE bloco_id = $1", [
      blocoOrigemId,
    ]);
    const time = timeRows[0];
    if (time) {
      await aplicarPontuacao({
        timeId: time.id,
        delta: -senso.pontos_nao_conformidade,
        motivo: `Chamado #${chamadoId} aberto (${senso.nome})`,
        origemTipo: "chamado",
        origemId: chamadoId,
      });
    }

    res.status(201).json({ id: chamadoId });
  } catch (err) {
    next(err);
  }
});

// RF08/RF10/RN04/RN05 — qualquer time resolve o chamado (mesmo de outro bloco) e,
// se o senso for recuperável, os pontos voltam para o time QUE RESOLVEU.
chamadosRouter.post("/:id/resolver", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolvidoPorUsuarioId, evidenciaResolucaoUrl } = req.body;

    const { rows: chamadoRows } = await pool.query(
      `SELECT c.*, s.pontos_nao_conformidade, s.recuperavel, s.nome as senso_nome
       FROM chamados c JOIN sensos s ON s.id = c.senso_id WHERE c.id = $1`,
      [id]
    );
    const chamado = chamadoRows[0];
    if (!chamado) return res.status(404).json({ erro: "Chamado não encontrado" });
    if (chamado.status !== "aberto") {
      return res.status(400).json({ erro: "Chamado não está aberto" });
    }

    const { rows: usuarioRows } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      resolvidoPorUsuarioId,
    ]);
    const usuario = usuarioRows[0];
    if (!usuario || !usuario.time_id) {
      return res.status(400).json({ erro: "Usuário resolvedor precisa pertencer a um time" });
    }

    await pool.query(
      `UPDATE chamados
       SET status = 'resolvido', resolvido_por_time_id = $1, resolvido_por_usuario_id = $2,
           evidencia_resolucao_url = $3, resolvido_em = NOW()
       WHERE id = $4`,
      [usuario.time_id, resolvidoPorUsuarioId, evidenciaResolucaoUrl ?? null, id]
    );

    // RN04 — Organização e Utilização não são recuperáveis, mesmo resolvendo o chamado.
    if (chamado.recuperavel) {
      await aplicarPontuacao({
        timeId: usuario.time_id,
        delta: chamado.pontos_nao_conformidade,
        motivo: `Chamado #${id} resolvido (${chamado.senso_nome})`,
        origemTipo: "chamado",
        origemId: Number(id),
      });
    }

    res.json({ ok: true, pontosRecuperados: chamado.recuperavel ? chamado.pontos_nao_conformidade : 0 });
  } catch (err) {
    next(err);
  }
});

// RF09/RN08 — marca chamados vencidos (fora do prazo). Chamar periodicamente
// (ex.: cron simples) ou sob demanda pelo frontend.
chamadosRouter.post("/verificar-vencidos", async (req, res, next) => {
  try {
    const { rows: abertos } = await pool.query(
      `SELECT * FROM chamados
       WHERE status = 'aberto'
       AND criado_em + (prazo_dias || ' days')::interval < NOW()`
    );

    for (const c of abertos) {
      await pool.query("UPDATE chamados SET status = 'vencido' WHERE id = $1", [c.id]);
    }

    res.json({ vencidos: abertos.length });
  } catch (err) {
    next(err);
  }
});
