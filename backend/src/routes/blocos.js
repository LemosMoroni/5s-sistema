import { Router } from "express";
import { pool } from "../db/index.js";

export const blocosRouter = Router();

blocosRouter.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM blocos ORDER BY nome");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

blocosRouter.post("/", async (req, res, next) => {
  try {
    const { nome } = req.body;
    const { rows } = await pool.query("INSERT INTO blocos (nome) VALUES ($1) RETURNING id", [nome]);
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    next(err);
  }
});
