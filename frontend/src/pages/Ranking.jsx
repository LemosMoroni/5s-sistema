import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Ranking() {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    api.ranking().then(setRanking);
  }, []);

  return (
    <div>
      <h2>Ranking geral</h2>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--azul-senai)", color: "white" }}>
              <th style={{ padding: 10, textAlign: "left" }}>#</th>
              <th style={{ padding: 10, textAlign: "left" }}>Time</th>
              <th style={{ padding: 10, textAlign: "left" }}>Bloco</th>
              <th style={{ padding: 10, textAlign: "left" }}>Pontuação</th>
              <th style={{ padding: 10, textAlign: "left" }}>Classificação</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 10 }}>{t.posicao}º</td>
                <td style={{ padding: 10 }}>{t.nome}</td>
                <td style={{ padding: 10 }}>{t.bloco_nome}</td>
                <td style={{ padding: 10 }}>{t.pontuacao_atual} / 500</td>
                <td style={{ padding: 10 }}>
                  <span className={`badge badge-${t.classificacao.label}`}>{t.classificacao.label}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
