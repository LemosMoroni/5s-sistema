import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";

export default function Mural() {
  const { usuario } = useAuth();
  const [chamados, setChamados] = useState([]);
  const [sensos, setSensos] = useState([]);
  const [blocos, setBlocos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novo, setNovo] = useState({ titulo: "", descricao: "", sensoId: "", blocoOrigemId: "", local: "" });
  const [erro, setErro] = useState(null);

  function carregar() {
    api.chamados().then(setChamados);
  }

  useEffect(() => {
    carregar();
    api.sensos().then(setSensos);
    api.blocos().then(setBlocos);
  }, []);

  const podeAbrirChamado = usuario.papel === "lider" || usuario.papel === "coordenador";

  async function criarChamado(e) {
    e.preventDefault();
    setErro(null);
    try {
      await api.criarChamado({
        ...novo,
        sensoId: Number(novo.sensoId),
        blocoOrigemId: Number(novo.blocoOrigemId),
        criadoPorId: usuario.id,
      });
      setNovo({ titulo: "", descricao: "", sensoId: "", blocoOrigemId: "", local: "" });
      setMostrarForm(false);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function resolver(id) {
    try {
      await api.resolverChamado(id, { resolvidoPorUsuarioId: usuario.id });
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Mural geral</h2>
        {podeAbrirChamado && (
          <button className="btn-primary" onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? "Cancelar" : "+ Novo chamado"}
          </button>
        )}
      </div>

      {erro && <p style={{ color: "red" }}>{erro}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={criarChamado}>
          <input
            placeholder="Título"
            required
            value={novo.titulo}
            onChange={(e) => setNovo({ ...novo, titulo: e.target.value })}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <textarea
            placeholder="Descrição"
            required
            value={novo.descricao}
            onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <input
            placeholder="Local (ex: Sala 3, Laboratório 4.0)"
            value={novo.local}
            onChange={(e) => setNovo({ ...novo, local: e.target.value })}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
          <select
            required
            value={novo.sensoId}
            onChange={(e) => setNovo({ ...novo, sensoId: e.target.value })}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          >
            <option value="">Senso...</option>
            {sensos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome} ({s.pontos_nao_conformidade} pts{!s.recuperavel ? " — não recuperável" : ""})
              </option>
            ))}
          </select>
          <select
            required
            value={novo.blocoOrigemId}
            onChange={(e) => setNovo({ ...novo, blocoOrigemId: e.target.value })}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          >
            <option value="">Bloco de origem...</option>
            {blocos.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </select>
          <button className="btn-primary" type="submit">
            Publicar chamado
          </button>
        </form>
      )}

      {chamados.map((c) => (
        <div className="card" key={c.id}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{c.titulo}</strong>
            <span className="badge" style={{ background: "#666" }}>
              {c.status}
            </span>
          </div>
          <p>{c.descricao}</p>
          <p style={{ fontSize: 13, color: "#555" }}>
            Senso: {c.senso_nome} ({c.pontos_nao_conformidade} pts) · Origem: {c.bloco_origem_nome} ·
            Aberto por {c.criado_por_nome}
          </p>
          {c.status === "aberto" && (
            <button className="btn-secondary" onClick={() => resolver(c.id)}>
              Marcar como resolvido (por mim/meu time)
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
