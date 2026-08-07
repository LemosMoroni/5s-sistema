import { Router } from "express";
import { db } from "../db/index.js";
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

feitosRouter.get("/", (req, res) => {
  const { status } = req.query;
  let query = selectBase;
  const params = [];
  if (status) {
    query += " WHERE f.status = ?";
    params.push(status);
  }
  query += " ORDER BY f.criado_em DESC";
  res.json(db.prepare(query).all(...params));
});

// RF11/RF12 — Influenciador cadastra feito por iniciativa própria
feitosRouter.post("/", (req, res) => {
  const { influenciadorId, sensoId, descricao, local, evidenciaUrl } = req.body;

  const influenciador = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(influenciadorId);
  if (!influenciador || influenciador.papel !== "influenciador") {
    return res.status(403).json({ erro: "Apenas Influenciadores cadastram feitos" });
  }

  const info = db
    .prepare(
      `INSERT INTO feitos (influenciador_id, senso_id, descricao, local, evidencia_url, status)
       VALUES (?, ?, ?, ?, ?, 'pendente')`
    )
    .run(influenciadorId, sensoId, descricao, local ?? null, evidenciaUrl ?? null);

  res.status(201).json({ id: info.lastInsertRowid });
});

// RF13/RF14/RF15 — Coordenador aprova ou reprova
feitosRouter.post("/:id/avaliar", (req, res) => {
  const { id } = req.params;
  const { aprovadoPorId, aprovado, justificativa } = req.body;

  const avaliador = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(aprovadoPorId);
  if (!avaliador || avaliador.papel !== "coordenador") {
    return res.status(403).json({ erro: "Apenas o Coordenador avalia feitos" });
  }

  const feito = db.prepare(selectBase + " WHERE f.id = ?").get(id);
  if (!feito) return res.status(404).json({ erro: "Feito não encontrado" });
  if (feito.status !== "pendente") {
    return res.status(400).json({ erro: "Feito já avaliado" });
  }

  if (!aprovado) {
    db.prepare(
      "UPDATE feitos SET status = 'reprovado', justificativa_reprovacao = ?, avaliado_em = datetime('now') WHERE id = ?"
    ).run(justificativa ?? null, id);
    return res.json({ ok: true, status: "reprovado" });
  }

  const pontos = Math.round(feito.pontos_nao_conformidade * MULTIPLICADOR_BONUS_INICIATIVA_PROPRIA);

  db.prepare(
    "UPDATE feitos SET status = 'aprovado', pontos_concedidos = ?, avaliado_em = datetime('now') WHERE id = ?"
  ).run(pontos, id);

  if (feito.time_id) {
    aplicarPontuacao({
      timeId: feito.time_id,
      delta: pontos,
      motivo: `Feito #${id} aprovado (${feito.senso_nome}) — iniciativa própria`,
      origemTipo: "feito",
      origemId: Number(id),
    });
  }

  res.json({ ok: true, status: "aprovado", pontosConcedidos: pontos });
});
