import { Router } from "express";
import { pool } from "../db/index.js";
import { classificar } from "./times.js";

export const rankingRouter = Router();

// RF21 — ranking geral dos setores/blocos
rankingRouter.get("/", async (req, res, next) => {
  try {
    const { rows: times } = await pool.query(
      `SELECT t.*, b.nome as bloco_nome
       FROM times t JOIN blocos b ON b.id = t.bloco_id
       ORDER BY t.pontuacao_atual DESC`
    );

    const ranking = times.map((t, idx) => ({
      posicao: idx + 1,
      ...t,
      pontos_perdidos: 500 - t.pontuacao_atual,
      classificacao: classificar(t.pontuacao_atual),
    }));

    res.json(ranking);
  } catch (err) {
    next(err);
  }
});

export const sensosRouter = Router();

sensosRouter.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM sensos ORDER BY id");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});
