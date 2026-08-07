import { app } from "../src/app.js";

// Entrypoint serverless da Vercel. O schema já deve ter sido aplicado no
// Supabase via `npm run db:migrate` — não roda DDL a cada cold start.
export default app;
