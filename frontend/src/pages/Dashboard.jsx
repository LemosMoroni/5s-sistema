import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";

export default function Dashboard() {
  const { usuario } = useAuth();
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    api.ranking().then(setRanking);
  }, []);

  const meuTime = ranking.find((t) => t.id === usuario.time_id);

  return (
    <div>
      <h2>Olá, {usuario.nome}</h2>

      {meuTime ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{meuTime.nome}</h3>
          <p>
            Pontuação atual: <strong>{meuTime.pontuacao_atual}</strong> / 500{" "}
            <span className={`badge badge-${meuTime.classificacao.label}`}>
              {meuTime.classificacao.label}
            </span>
          </p>
          <p>Posição no ranking geral: {meuTime.posicao}º</p>
        </div>
      ) : (
        <div className="card">
          <p>
            {usuario.papel === "coordenador"
              ? "Você tem visão geral de todos os times — veja o Ranking e o Mural."
              : "Você ainda não está vinculado a um time."}
          </p>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Acesso rápido</h3>
        <ul>
          <li>Mural — veja e resolva chamados abertos</li>
          {usuario.papel === "influenciador" && (
            <li>Cadastrar Feito — registre uma melhoria feita por iniciativa própria</li>
          )}
          {usuario.papel === "coordenador" && <li>Aprovações — avalie feitos pendentes</li>}
          <li>Ranking — classificação geral dos setores</li>
        </ul>
      </div>
    </div>
  );
}
