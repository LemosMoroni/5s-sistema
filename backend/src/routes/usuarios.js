import { Router } from "express";
import { pool } from "../db/index.js";

export const usuariosRouter = Router();

// Lista usuários, opcionalmente filtrando por bloco ou papel
usuariosRouter.get("/", async (req, res, next) => {
  try {
    const { blocoId, papel } = req.query;
    let query = `SELECT u.*, b.nome as bloco_nome, t.nome as time_nome
                 FROM usuarios u
                 LEFT JOIN blocos b ON b.id = u.bloco_id
                 LEFT JOIN times t ON t.id = u.time_id
                 WHERE u.ativo = 1`;
    const params = [];
    if (blocoId) {
      params.push(blocoId);
      query += ` AND u.bloco_id = $${params.length}`;
    }
    if (papel) {
      params.push(papel);
      query += ` AND u.papel = $${params.length}`;
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// RF01 — Coordenador cadastra líderes (vinculados a um bloco)
// RF03 — Líder cadastra influenciadores (vinculados ao seu bloco/time)
usuariosRouter.post("/", async (req, res, next) => {
  try {
    const { nome, papel, blocoId, timeId, criadoPorId } = req.body;

    if (!["coordenador", "lider", "influenciador"].includes(papel)) {
      return res.status(400).json({ erro: "Papel inválido" });
    }

    // RF04 — só Coordenador cadastra Líder; só Líder (ou Coordenador) cadastra Influenciador
    const { rows: criadorRows } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      criadoPorId,
    ]);
    const criador = criadorRows[0];
    if (!criador) return res.status(403).json({ erro: "Usuário criador inválido" });

    if (papel === "lider" && criador.papel !== "coordenador") {
      return res.status(403).json({ erro: "Apenas o Coordenador pode cadastrar Líderes" });
    }
    if (papel === "influenciador" && !["coordenador", "lider"].includes(criador.papel)) {
      return res.status(403).json({ erro: "Influenciadores não podem cadastrar usuários" });
    }

    const { rows } = await pool.query(
      "INSERT INTO usuarios (nome, papel, bloco_id, time_id) VALUES ($1, $2, $3, $4) RETURNING id",
      [nome, papel, blocoId ?? null, timeId ?? null]
    );

    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    next(err);
  }
});
