// Em dev local, o Vite faz proxy de /api para o backend (vite.config.js).
// Em produção (Vercel), o frontend e o backend são projetos separados, então
// aponta para a URL pública do backend via VITE_API_URL.
const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const erro = await res.json().catch(() => ({ erro: res.statusText }));
    throw new Error(erro.erro || "Erro na requisição");
  }
  return res.json();
}

export const api = {
  login: (usuarioId) => request("/auth/login", { method: "POST", body: JSON.stringify({ usuarioId }) }),
  usuarios: (params = "") => request("/usuarios" + params),
  criarUsuario: (data) => request("/usuarios", { method: "POST", body: JSON.stringify(data) }),
  blocos: () => request("/blocos"),
  times: () => request("/times"),
  sensos: () => request("/sensos"),
  ranking: () => request("/ranking"),
  chamados: (status) => request("/chamados" + (status ? `?status=${status}` : "")),
  criarChamado: (data) => request("/chamados", { method: "POST", body: JSON.stringify(data) }),
  resolverChamado: (id, data) =>
    request(`/chamados/${id}/resolver`, { method: "POST", body: JSON.stringify(data) }),
  feitos: (status) => request("/feitos" + (status ? `?status=${status}` : "")),
  criarFeito: (data) => request("/feitos", { method: "POST", body: JSON.stringify(data) }),
  avaliarFeito: (id, data) =>
    request(`/feitos/${id}/avaliar`, { method: "POST", body: JSON.stringify(data) }),
};
