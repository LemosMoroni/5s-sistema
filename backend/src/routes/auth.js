import { Router } from "express";
import { db } from "../db/index.js";

export const authRouter = Router();

// Login simplificado (fase de protótipo): retorna o usuário pelo id.
// TODO: substituir por autenticação real (senha/SSO) quando o sistema sair do
// ambiente local.
authRouter.post("/login", (req, res) => {
  const { usuarioId } = req.body;
  const usuario = db
    .prepare(
      `SELECT u.*, b.nome as bloco_nome, t.nome as time_nome
       FROM usuarios u
       LEFT JOIN blocos b ON b.id = u.bloco_id
       LEFT JOIN times t ON t.id = u.time_id
       WHERE u.id = ? AND u.ativo = 1`
    )
    .get(usuarioId);

  if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
  res.json(usuario);
});
