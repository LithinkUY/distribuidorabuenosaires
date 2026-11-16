import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { api, fmt, errMsg } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const Box = ({ title, children }) => (
  <div className="max-w-md mx-auto px-4 py-16"><div className="card-theme p-8 space-y-5 shadow-sm"><h1 className="text-2xl font-bold">{title}</h1>{children}</div></div>
);
const Input = (p) => <input {...p} className="input-theme w-full px-3 py-2.5" />;

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const submit = async (e) => {
    e.preventDefault();
    try { const u = await login(f.email, f.password); nav(u.role === "ADMIN" ? "/admin" : "/cuenta"); } catch (er) { toast.error(errMsg(er)); }
  };
  return (
    <Box title="Iniciar sesión">
      <form onSubmit={submit} className="space-y-3" data-testid="login-form">
        <Input data-testid="login-email" type="email" placeholder="Email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Input data-testid="login-password" type="password" placeholder="Contraseña" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button data-testid="login-submit" className="btn-theme w-full py-3 font-bold">Ingresar</button>
      </form>
      <p className="text-sm text-center">¿No tenés cuenta? <Link to="/registro" className="underline" data-testid="go-register">Registrate</Link></p>
    </Box>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const submit = async (e) => {
    e.preventDefault();
    try { await register(f); toast.success("Cuenta creada"); nav("/cuenta"); } catch (er) { toast.error(errMsg(er)); }
  };
  return (
    <Box title="Crear cuenta">
      <form onSubmit={submit} className="space-y-3" data-testid="register-form">
        {[["name", "Nombre", "text"], ["email", "Email", "email"], ["phone", "Teléfono", "text"], ["password", "Contraseña (mín. 6)", "password"]].map(([k, ph, t]) => (
          <Input key={k} data-testid={`register-${k}`} type={t} placeholder={ph} required={k !== "phone"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
        ))}
        <button data-testid="register-submit" className="btn-theme w-full py-3 font-bold">Registrarme</button>
      </form>
    </Box>
  );
}

export function AccountPage() {
  const { user, ready, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  useEffect(() => { if (user) api.get("/me/orders").then((r) => setOrders(r.data)); }, [user]);
  if (!ready) return null;
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="max-w-4xl mx-auto px-4 py-14 space-y-8" data-testid="account-page">
      <div className="flex justify-between items-end">
        <div><h1 className="text-3xl font-bold">Hola, {user.name}</h1><p className="text-ink-muted text-sm">{user.email}</p></div>
        <div className="flex gap-2">
          {user.role === "ADMIN" && <Link to="/admin" className="btn-theme px-4 py-2 text-sm" data-testid="account-admin-link">Panel admin</Link>}
          <button onClick={logout} className="btn-outline-theme px-4 py-2 text-sm" data-testid="logout-btn">Cerrar sesión</button>
        </div>
      </div>
      <h2 className="text-xl font-bold">Mis pedidos</h2>
      {!orders.length && <p className="text-ink-muted" data-testid="account-no-orders">Todavía no realizaste pedidos.</p>}
      <div className="space-y-3">
        {orders.map((o) => (
          <Link key={o.id} to={`/orden/${o.id}`} className="card-theme p-4 flex justify-between items-center hover:shadow-md transition-shadow" data-testid={`account-order-${o.number}`}>
            <div><b>#{o.number}</b><p className="text-xs text-ink-muted">{new Date(o.created_at).toLocaleDateString("es-AR")} · {o.items.length} productos</p></div>
            <div className="text-right"><b>{fmt(o.total, o.currency)}</b><p className="text-xs">{o.status}</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
