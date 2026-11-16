import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) { setReady(true); return; }
    api.get("/auth/me").then((r) => setUser(r.data)).catch(() => localStorage.removeItem("token")).finally(() => setReady(true));
  }, []);

  const finish = (data) => { localStorage.setItem("token", data.token); setUser(data.user); return data.user; };
  const login = async (email, password) => finish((await api.post("/auth/login", { email, password })).data);
  const register = async (body) => finish((await api.post("/auth/register", body)).data);
  const logout = () => { localStorage.removeItem("token"); setUser(null); };

  return <AuthCtx.Provider value={{ user, ready, login, register, logout }}>{children}</AuthCtx.Provider>;
}
