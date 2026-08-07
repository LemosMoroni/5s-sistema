import { db } from "./index.js";

/**
 * Aplica uma variação de pontos a um time e registra no histórico (auditoria — RNF03).
 * delta positivo = ganho de pontos, negativo = perda.
 */
export function aplicarPontuacao({ timeId, delta, motivo, origemTipo, origemId }) {
  const atualizaTime = db.prepare(
    "UPDATE times SET pontuacao_atual = pontuacao_atual + ? WHERE id = ?"
  );
  const registraHistorico = db.prepare(
    `INSERT INTO historico_pontos (time_id, delta, motivo, origem_tipo, origem_id)
     VALUES (?, ?, ?, ?, ?)`
  );

  const transacao = db.transaction(() => {
    atualizaTime.run(delta, timeId);
    registraHistorico.run(timeId, delta, motivo, origemTipo, origemId ?? null);
  });
  transacao();
}
