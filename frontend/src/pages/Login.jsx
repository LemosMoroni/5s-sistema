import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const [usuarios, setUsuarios] = useState([]);
  const [selecionado, setSelecionado] = useState("");
  const [erro, setErro] = useState(null);
  const { setUsuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.usuarios().then(setUsuarios).catch((e) => setErro(e.message));
  }, []);

  async function entrar() {
    if (!selecionado) return;
    try {
      const usuario = await api.login(Number(selecionado));
      setUsuario(usuario);
      navigate("/");
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: 360 }}>
        <h2 style={{ color: "var(--azul-senai)" }}>Programa 5S — SENAI</h2>
        <p>Selecione seu usuário para entrar (protótipo local — sem senha ainda).</p>
        {erro && <p style={{ color: "red" }}>{erro}</p>}
        <select
          value={selecionado}
          onChange={(e) => setSelecionado(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        >
          <option value="">Selecione...</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome} — {u.papel} {u.bloco_nome ? `(${u.bloco_nome})` : ""}
            </option>
          ))}
        </select>
        <button className="btn-primary" onClick={entrar} style={{ width: "100%" }}>
          Entrar
        </button>
      </div>
    </div>
  );
}
