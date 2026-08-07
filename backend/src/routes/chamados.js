import { Router } from "express";
import { db } from "../db/index.js";
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
chamadosRouter.get("/", (req, res) => {
  const { status } = req.query;
  let query = selectBase;
  const params = [];
  if (status) {
    query += " WHERE c.status = ?";
    params.push(status);
  }
  query += " ORDER BY c.criado_em DESC";
  res.json(db.prepare(query).all(...params));
});

// RF05/RF06 — Líder ou Coordenador cadastra chamado; a perda de pontos do bloco
// de origem é aplicada imediatamente (regra provisória — ver RN08 e TODO abaixo)
chamadosRouter.post("/", (req, res) => {
  const { titulo, descricao, sensoId, local, evidenciaUrl, criadoPorId, blocoOrigemId, prazoDias } =
    req.body;

  const criador = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(criadoPorId);
  if (!criador || !["coordenador", "lider"].includes(criador.papel)) {
    return res.status(403).json({ erro: "Apenas Líder ou Coordenador podem abrir chamados" });
  }

  const senso = db.prepare("SELECT * FROM sensos WHERE id = ?").get(sensoId);
  if (!senso) return res.status(400).json({ erro: "Senso inválido" });

  const info = db
    .prepare(
      `INSERT INTO chamados
       (titulo, descricao, senso_id, local, evidencia_url, criado_por, bloco_origem_id, prazo_dias, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aberto')`
    )
    .run(
      titulo,
      descricao,
      sensoId,
      local ?? null,
      evidenciaUrl ?? null,
      criadoPorId,
      blocoOrigemId,
      prazoDias ?? 7 // TODO: validar prazo padrão ("tempo hábil") com a coordenação
    );

  // Desconta os pontos do time do bloco de origem assim que a não conformidade é registrada.
  // Se for resolvida a tempo (RN05), os pontos recuperáveis retornam via rota /resolver.
  const time = db.prepare("SELECT * FROM times WHERE bloco_id = ?").get(blocoOrigemId);
  if (time) {
    aplicarPontuacao({
      timeId: time.id,
      delta: -senso.pontos_nao_conformidade,
      motivo: `Chamado #${info.lastInsertRowid} aberto (${senso.nome})`,
      origemTipo: "chamado",
      origemId: info.lastInsertRowid,
    });
  }

  res.status(201).json({ id: info.lastInsertRowid });
});

// RF08/RF10/RN04/RN05 — qualquer time resolve o chamado (mesmo de outro bloco) e,
// se o senso for recuperável, os pontos voltam para o time QUE RESOLVEU.
chamadosRouter.post("/:id/resolver", (req, res) => {
  const { id } = req.params;
  const { resolvidoPorUsuarioId, evidenciaResolucaoUrl } = req.body;

  const chamado = db
    .prepare(
      `SELECT c.*, s.pontos_nao_conformidade, s.recuperavel, s.nome as senso_nome
       FROM chamados c JOIN sensos s ON s.id = c.senso_id WHERE c.id = ?`
    )
    .get(id);
  if (!chamado) return res.status(404).json({ erro: "Chamado não encontrado" });
  if (chamado.status !== "aberto") {
    return res.status(400).json({ erro: "Chamado não está aberto" });
  }

  const usuario = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(resolvidoPorUsuarioId);
  if (!usuario || !usuario.time_id) {
    return res.status(400).json({ erro: "Usuário resolvedor precisa pertencer a um time" });
  }

  db.prepare(
    `UPDATE chamados
     SET status = 'resolvido', resolvido_por_time_id = ?, resolvido_por_usuario_id = ?,
         evidencia_resolucao_url = ?, resolvido_em = datetime('now')
     WHERE id = ?`
  ).run(usuario.time_id, resolvidoPorUsuarioId, evidenciaResolucaoUrl ?? null, id);

  // RN04 — Organização e Utilização não são recuperáveis, mesmo resolvendo o chamado.
  if (chamado.recuperavel) {
    aplicarPontuacao({
      timeId: usuario.time_id,
      delta: chamado.pontos_nao_conformidade,
      motivo: `Chamado #${id} resolvido (${chamado.senso_nome})`,
      origemTipo: "chamado",
      origemId: Number(id),
    });
  }

  res.json({ ok: true, pontosRecuperados: chamado.recuperavel ? chamado.pontos_nao_conformidade : 0 });
});

// RF09/RN08 — marca chamados vencidos (fora do prazo). Chamar periodicamente
// (ex.: cron simples) ou sob demanda pelo frontend.
chamadosRouter.post("/verificar-vencidos", (req, res) => {
  const abertos = db
    .prepare(
      `SELECT * FROM chamados
       WHERE status = 'aberto'
       AND datetime(criado_em, '+' || prazo_dias || ' days') < datetime('now')`
    )
    .all();

  const marcarVencido = db.prepare("UPDATE chamados SET status = 'vencido' WHERE id = ?");
  abertos.forEach((c) => marcarVencido.run(c.id));

  res.json({ vencidos: abertos.length });
});
