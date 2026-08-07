import "dotenv/config";
import { app } from "./app.js";
import { initSchema } from "./db/index.js";

await initSchema();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API do Sistema 5S rodando em http://localhost:${PORT}`);
});
