import { Router } from "express";
import { db } from "../db/index.js";

export const blocosRouter = Router();

blocosRouter.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM blocos ORDER BY nome").all());
});

blocosRouter.post("/", (req, res) => {
  const { nome } = req.body;
  const info = db.prepare("INSERT INTO blocos (nome) VALUES (?)").run(nome);
  res.status(201).json({ id: info.lastInsertRowid });
});
