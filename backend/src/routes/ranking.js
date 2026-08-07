import { Router } from "express";
import { db } from "../db/index.js";
import { classificar } from "./times.js";

export const rankingRouter = Router();

// RF21 — ranking geral dos setores/blocos
rankingRouter.get("/", (req, res) => {
  const times = db
    .prepare(
      `SELECT t.*, b.nome as bloco_nome
       FROM times t JOIN blocos b ON b.id = t.bloco_id
       ORDER BY t.pontuacao_atual DESC`
    )
    .all();

  const ranking = times.map((t, idx) => ({
    posicao: idx + 1,
    ...t,
    pontos_perdidos: 500 - t.pontuacao_atual,
    classificacao: classificar(t.pontuacao_atual),
  }));

  res.json(ranking);
});

export const sensosRouter = Router();

sensosRouter.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM sensos ORDER BY id").all());
});
