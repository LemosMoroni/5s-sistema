import "dotenv/config";
import { pool, initSchema } from "./index.js";

await initSchema();
console.log("Schema aplicado com sucesso.");
await pool.end();
