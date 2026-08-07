import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { usuariosRouter } from "./routes/usuarios.js";
import { blocosRouter } from "./routes/blocos.js";
import { timesRouter } from "./routes/times.js";
import { chamadosRouter } from "./routes/chamados.js";
import { feitosRouter } from "./routes/feitos.js";
import { rankingRouter, sensosRouter } from "./routes/ranking.js";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/blocos", blocosRouter);
app.use("/api/times", timesRouter);
app.use("/api/chamados", chamadosRouter);
app.use("/api/feitos", feitosRouter);
app.use("/api/ranking", rankingRouter);
app.use("/api/sensos", sensosRouter);

// Handler de erro central — todas as rotas usam next(err) em caso de falha.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
});
