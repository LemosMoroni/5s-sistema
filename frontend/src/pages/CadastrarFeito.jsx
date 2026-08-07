import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";

export default function CadastrarFeito() {
  const { usuario } = useAuth();
  const [sensos, setSensos] = useState([]);
  const [form, setForm] = useState({ sensoId: "", descricao: "", local: "" });
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api.sensos().then(setSensos);
  }, []);

  async function enviar(e) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);
    try {
      await api.criarFeito({
        ...form,
        sensoId: Number(form.sensoId),
        influenciadorId: usuario.id,
      });
      setForm({ sensoId: "", descricao: "", local: "" });
      setMensagem("Feito enviado para aprovação do coordenador!");
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div>
      <h2>Cadastrar Feito 5S</h2>
      <p>
        Registre uma melhoria que você realizou por conta própria. Se aprovada pelo coordenador,
        seu time recebe um bônus de pontos maior do que resolver um chamado do mural.
      </p>

      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}
      {erro && <p style={{ color: "red" }}>{erro}</p>}

      <form className="card" onSubmit={enviar}>
        <select
          required
          value={form.sensoId}
          onChange={(e) => setForm({ ...form, sensoId: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        >
          <option value="">Senso praticado...</option>
          {sensos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
        <textarea
          placeholder="O que você fez?"
          required
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          placeholder="Local"
          value={form.local}
          onChange={(e) => setForm({ ...form, local: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        {/* TODO: upload real de evidência (foto) — ainda não implementado nesta v0 */}
        <button className="btn-primary" type="submit">
          Enviar para aprovação
        </button>
      </form>
    </div>
  );
}
