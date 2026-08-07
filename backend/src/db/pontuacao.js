import { pool } from "./index.js";

/**
 * Aplica uma variação de pontos a um time e registra no histórico (auditoria — RNF03).
 * delta positivo = ganho de pontos, negativo = perda.
 */
export async function aplicarPontuacao({ timeId, delta, motivo, origemTipo, origemId }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE times SET pontuacao_atual = pontuacao_atual + $1 WHERE id = $2", [
      delta,
      timeId,
    ]);
    await client.query(
      `INSERT INTO historico_pontos (time_id, delta, motivo, origem_tipo, origem_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [timeId, delta, motivo, origemTipo, origemId ?? null]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
