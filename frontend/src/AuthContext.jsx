import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario5s");
    return salvo ? JSON.parse(salvo) : null;
  });

  useEffect(() => {
    if (usuario) localStorage.setItem("usuario5s", JSON.stringify(usuario));
    else localStorage.removeItem("usuario5s");
  }, [usuario]);

  return (
    <AuthContext.Provider value={{ usuario, setUsuario }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
