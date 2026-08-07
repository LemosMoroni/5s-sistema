import { Router } from "express";
import { pool } from "../db/index.js";
import { aplicarPontuacao } from "../db/pontuacao.js";

export const feitosRouter = Router();

// TODO: valor exato do bônus de iniciativa própria a validar com a coordenação.
// Provisório: 1.5x os pontos do senso.
const MULTIPLICADOR_BONUS_INICIATIVA_PROPRIA = 1.5;

const selectBase = `
  SELECT f.*, s.nome as senso_nome, s.pontos_nao_conformidade,
         u.nome as influenciador_nome, u.time_id
  FROM feitos f
  JOIN sensos s ON s.id = f.senso_id
  JOIN usuarios u ON u.id = f.influenciador_id
`;

feitosRouter.get("/", async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = selectBase;
    const params = [];
    if (status) {
      params.push(status);
      query += ` WHERE f.status = $${params.length}`;
    }
    query += " ORDER BY f.criado_em DESC";
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// RF11/RF12 — Influenciador cadastra feito por iniciativa própria
feitosRouter.post("/", async (req, res, next) => {
  try {
    const { influenciadorId, sensoId, descricao, local, evidenciaUrl } = req.body;

    const { rows: influenciadorRows } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      influenciadorId,
    ]);
    const influenciador = influenciadorRows[0];
    if (!influenciador || influenciador.papel !== "influenciador") {
      return res.status(403).json({ erro: "Apenas Influenciadores cadastram feitos" });
    }

    const { rows } = await pool.query(
      `INSERT INTO feitos (influenciador_id, senso_id, descricao, local, evidencia_url, status)
       VALUES ($1, $2, $3, $4, $5, 'pendente')
       RETURNING id`,
      [influenciadorId, sensoId, descricao, local ?? null, evidenciaUrl ?? null]
    );

    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    next(err);
  }
});

// RF13/RF14/RF15 — Coordenador aprova ou reprova
feitosRouter.post("/:id/avaliar", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { aprovadoPorId, aprovado, justificativa } = req.body;

    const { rows: avaliadorRows } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      aprovadoPorId,
    ]);
    const avaliador = avaliadorRows[0];
    if (!avaliador || avaliador.papel !== "coordenador") {
      return res.status(403).json({ erro: "Apenas o Coordenador avalia feitos" });
    }

    const { rows: feitoRows } = await pool.query(selectBase + " WHERE f.id = $1", [id]);
    const feito = feitoRows[0];
    if (!feito) return res.status(404).json({ erro: "Feito não encontrado" });
    if (feito.status !== "pendente") {
      return res.status(400).json({ erro: "Feito já avaliado" });
    }

    if (!aprovado) {
      await pool.query(
        "UPDATE feitos SET status = 'reprovado', justificativa_reprovacao = $1, avaliado_em = NOW() WHERE id = $2",
        [justificativa ?? null, id]
      );
      return res.json({ ok: true, status: "reprovado" });
    }

    const pontos = Math.round(feito.pontos_nao_conformidade * MULTIPLICADOR_BONUS_INICIATIVA_PROPRIA);

    await pool.query(
      "UPDATE feitos SET status = 'aprovado', pontos_concedidos = $1, avaliado_em = NOW() WHERE id = $2",
      [pontos, id]
    );

    if (feito.time_id) {
      await aplicarPontuacao({
        timeId: feito.time_id,
        delta: pontos,
        motivo: `Feito #${id} aprovado (${feito.senso_nome}) — iniciativa própria`,
        origemTipo: "feito",
        origemId: Number(id),
      });
    }

    res.json({ ok: true, status: "aprovado", pontosConcedidos: pontos });
  } catch (err) {
    next(err);
  }
});
