import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";

export default function Aprovacoes() {
  const { usuario } = useAuth();
  const [feitos, setFeitos] = useState([]);
  const [erro, setErro] = useState(null);

  function carregar() {
    api.feitos("pendente").then(setFeitos);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function avaliar(id, aprovado) {
    try {
      await api.avaliarFeito(id, { aprovadoPorId: usuario.id, aprovado });
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div>
      <h2>Aprovações de feitos</h2>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
      {feitos.length === 0 && <p>Nenhum feito pendente no momento.</p>}
      {feitos.map((f) => (
        <div className="card" key={f.id}>
          <strong>{f.influenciador_nome}</strong> — {f.senso_nome}
          <p>{f.descricao}</p>
          {f.local && <p style={{ fontSize: 13, color: "#555" }}>Local: {f.local}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={() => avaliar(f.id, true)}>
              Aprovar
            </button>
            <button className="btn-secondary" onClick={() => avaliar(f.id, false)}>
              Reprovar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
