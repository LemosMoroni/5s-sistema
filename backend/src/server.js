import express from "express";
import cors from "cors";
import { initSchema } from "./db/index.js";
import { authRouter } from "./routes/auth.js";
import { usuariosRouter } from "./routes/usuarios.js";
import { blocosRouter } from "./routes/blocos.js";
import { timesRouter } from "./routes/times.js";
import { chamadosRouter } from "./routes/chamados.js";
import { feitosRouter } from "./routes/feitos.js";
import { rankingRouter, sensosRouter } from "./routes/ranking.js";

initSchema();

const app = express();
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API do Sistema 5S rodando em http://localhost:${PORT}`);
});
