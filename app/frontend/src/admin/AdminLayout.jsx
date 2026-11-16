import { useState } from "react";
import { NavLink, Outlet, Navigate, Link } from "react-router-dom";
import { LayoutDashboard, Palette, LayoutTemplate, PanelTop, PanelBottom, FileText, Package, FolderTree, DollarSign, Ticket, ShoppingCart, Users, CreditCard, MessageSquare, ExternalLink, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  ["", "Dashboard", LayoutDashboard], ["pedidos", "Pedidos", ShoppingCart], ["productos", "Productos y stock", Package],
  ["catalogo", "Categorías y marcas", FolderTree], ["precios", "Precios, cotización y envíos", DollarSign], ["cupones", "Cupones", Ticket],
  ["comentarios", "Comentarios", MessageSquare],
  ["tema", "Tema y estilos", Palette], ["home", "Constructor Home", LayoutTemplate], ["cabecera", "Header, menú y buscador", PanelTop],
  ["sitio", "Footer, WhatsApp y Pop-up", PanelBottom], ["paginas", "Páginas extra", FileText], ["pagos", "Pasarelas de pago", CreditCard], ["usuarios", "Usuarios", Users],
];

export default function AdminLayout() {
  const { user, ready, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!ready) return null;
  if (!user || user.role !== "ADMIN") return <Navigate to="/login" />;
  const nav = (
    <nav className="flex flex-col gap-0.5" data-testid="admin-sidebar">
      {LINKS.map(([to, label, I]) => (
        <NavLink key={to} to={`/admin${to ? "/" + to : ""}`} end={!to} onClick={() => setOpen(false)} data-testid={`admin-nav-${to || "dashboard"}`}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? "bg-white text-zinc-900 font-semibold" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}>
          <I className="w-4 h-4" />{label}
        </NavLink>
      ))}
    </nav>
  );
  return (
    <div className="admin-root min-h-screen flex">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" />
      <aside className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-zinc-950 p-4 flex flex-col gap-6 overflow-y-auto transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-3 pt-2"><p className="text-white font-extrabold tracking-wider">PANEL CMS</p><p className="text-zinc-500 text-xs">{user.email}</p></div>
        {nav}
        <div className="mt-auto space-y-1">
          <Link to="/" target="_blank" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white" data-testid="admin-view-store"><ExternalLink className="w-4 h-4" />Ver tienda</Link>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white" data-testid="admin-logout"><LogOut className="w-4 h-4" />Cerrar sesión</button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center gap-3"><button onClick={() => setOpen(true)} data-testid="admin-menu-btn"><Menu /></button><b>Panel CMS</b></div>
        <main className="p-4 sm:p-8 max-w-[1400px]"><Outlet /></main>
      </div>
    </div>
  );
}
