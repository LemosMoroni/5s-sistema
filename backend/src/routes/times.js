import { Router } from "express";
import { db } from "../db/index.js";

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

timesRouter.get("/", (req, res) => {
  const times = db
    .prepare(
      `SELECT t.*, b.nome as bloco_nome
       FROM times t JOIN blocos b ON b.id = t.bloco_id
       ORDER BY t.pontuacao_atual DESC`
    )
    .all();

  const comClassificacao = times.map((t) => ({
    ...t,
    pontos_perdidos: 500 - t.pontuacao_atual,
    classificacao: classificar(t.pontuacao_atual),
  }));

  res.json(comClassificacao);
});

timesRouter.post("/", (req, res) => {
  const { nome, blocoId } = req.body;
  const info = db
    .prepare("INSERT INTO times (nome, bloco_id, pontuacao_atual) VALUES (?, ?, 500)")
    .run(nome, blocoId);
  res.status(201).json({ id: info.lastInsertRowid });
});
