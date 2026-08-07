import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Mural from "./pages/Mural.jsx";
import CadastrarFeito from "./pages/CadastrarFeito.jsx";
import Ranking from "./pages/Ranking.jsx";
import Aprovacoes from "./pages/Aprovacoes.jsx";

function Layout({ children }) {
  const { usuario, setUsuario } = useAuth();
  return (
    <div>
      <header className="app-header">
        <h1>Programa 5S — SENAI</h1>
        {usuario && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>
              {usuario.nome} · <strong>{usuario.papel}</strong>
            </span>
            <button className="btn-secondary" onClick={() => setUsuario(null)}>
              Sair
            </button>
          </div>
        )}
      </header>
      {usuario && (
        <nav className="tabs">
          <NavLink to="/" end>
            Painel
          </NavLink>
          <NavLink to="/mural">Mural</NavLink>
          {usuario.papel === "influenciador" && <NavLink to="/cadastrar-feito">Cadastrar Feito</NavLink>}
          {usuario.papel === "coordenador" && <NavLink to="/aprovacoes">Aprovações</NavLink>}
          <NavLink to="/ranking">Ranking</NavLink>
        </nav>
      )}
      <div className="container">{children}</div>
    </div>
  );
}

function RotaProtegida({ children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <RotaProtegida>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/mural" element={<Mural />} />
                <Route path="/cadastrar-feito" element={<CadastrarFeito />} />
                <Route path="/aprovacoes" element={<Aprovacoes />} />
                <Route path="/ranking" element={<Ranking />} />
              </Routes>
            </Layout>
          </RotaProtegida>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
