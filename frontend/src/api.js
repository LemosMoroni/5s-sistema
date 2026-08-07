const BASE = "/api";

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
