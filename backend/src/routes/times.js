import { Router } from "express";
import { pool } from "../db/index.js";

export const timesRouter = Router();

// RF20 — classificação por faixa de pontuação (Legenda do manual)
// Faixas do manual são descritas como "pontos perdidos" (0-125 Ótimo ... 376-500 Ruim).
// Aqui pontuacao_atual é o placar restante (começa em 500), então invertemos:
// pontos_perdidos = 500 - pontuacao_atual
export function classificar(pontuacaoAtual) {
  const pontosPerdidos = 500 - pontuacaoAtual;
  if (pontosPerdidos <= 125) return { label: "Ótimo", cor: "verde" };
  if (pontosPerdidos <= 250) return { label: "Bom", cor: "azul" };
  if (pontosPerdidos <= 375) return { label: "Regular", cor: "amarelo" };
  return { label: "Ruim", cor: "vermelho" };
}

timesRouter.get("/", async (req, res, next) => {
  try {
    const { rows: times } = await pool.query(
      `SELECT t.*, b.nome as bloco_nome
       FROM times t JOIN blocos b ON b.id = t.bloco_id
       ORDER BY t.pontuacao_atual DESC`
    );

    const comClassificacao = times.map((t) => ({
      ...t,
      pontos_perdidos: 500 - t.pontuacao_atual,
      classificacao: classificar(t.pontuacao_atual),
    }));

    res.json(comClassificacao);
  } catch (err) {
    next(err);
  }
});

timesRouter.post("/", async (req, res, next) => {
  try {
    const { nome, blocoId } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO times (nome, bloco_id, pontuacao_atual) VALUES ($1, $2, 500) RETURNING id",
      [nome, blocoId]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    next(err);
  }
});
