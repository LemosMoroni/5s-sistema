import { Router } from "express";
import { db } from "../db/index.js";

export const usuariosRouter = Router();

// Lista usuários, opcionalmente filtrando por bloco ou papel
usuariosRouter.get("/", (req, res) => {
  const { blocoId, papel } = req.query;
  let query = `SELECT u.*, b.nome as bloco_nome, t.nome as time_nome
               FROM usuarios u
               LEFT JOIN blocos b ON b.id = u.bloco_id
               LEFT JOIN times t ON t.id = u.time_id
               WHERE u.ativo = 1`;
  const params = [];
  if (blocoId) {
    query += " AND u.bloco_id = ?";
    params.push(blocoId);
  }
  if (papel) {
    query += " AND u.papel = ?";
    params.push(papel);
  }
  res.json(db.prepare(query).all(...params));
});

// RF01 — Coordenador cadastra líderes (vinculados a um bloco)
// RF03 — Líder cadastra influenciadores (vinculados ao seu bloco/time)
usuariosRouter.post("/", (req, res) => {
  const { nome, papel, blocoId, timeId, criadoPorId } = req.body;

  if (!["coordenador", "lider", "influenciador"].includes(papel)) {
    return res.status(400).json({ erro: "Papel inválido" });
  }

  // RF04 — só Coordenador cadastra Líder; só Líder (ou Coordenador) cadastra Influenciador
  const criador = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(criadoPorId);
  if (!criador) return res.status(403).json({ erro: "Usuário criador inválido" });

  if (papel === "lider" && criador.papel !== "coordenador") {
    return res.status(403).json({ erro: "Apenas o Coordenador pode cadastrar Líderes" });
  }
  if (papel === "influenciador" && !["coordenador", "lider"].includes(criador.papel)) {
    return res.status(403).json({ erro: "Influenciadores não podem cadastrar usuários" });
  }

  const info = db
    .prepare("INSERT INTO usuarios (nome, papel, bloco_id, time_id) VALUES (?, ?, ?, ?)")
    .run(nome, papel, blocoId ?? null, timeId ?? null);

  res.status(201).json({ id: info.lastInsertRowid });
});
