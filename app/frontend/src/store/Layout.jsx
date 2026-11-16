import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSite } from "@/context/ThemeContext";
import Header from "@/store/Header";
import CartDrawer from "@/store/CartDrawer";
import { Footer, WhatsAppFloat, PromoPopup } from "@/store/Footer";

function TopBar({ cfg }) {
  const [i, setI] = useState(0);
  const msgs = (cfg?.messages || []).filter(Boolean);
  useEffect(() => {
    if (!cfg?.rotate || msgs.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % msgs.length), 3500);
    return () => clearInterval(t);
  }, [cfg?.rotate, msgs.length]);
  if (!cfg?.enabled || !msgs.length) return null;
  return (
    <div data-testid="topbar" className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-center py-2 px-4"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.rotate ? <span key={i} className="ticker inline-block">{msgs[i % msgs.length]}</span> : msgs.join("  ·  ")}
    </div>
  );
}

export default function StoreLayout() {
  const { settings } = useSite();
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  if (!settings) return <div className="min-h-screen grid place-items-center text-sm opacity-60" data-testid="store-loading">Cargando tienda…</div>;
  return (
    <div className="min-h-screen flex flex-col bg-page text-ink font-theme">
      <TopBar cfg={settings.topbar} />
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <WhatsAppFloat />
      <PromoPopup />
      <CartDrawer />
    </div>
  );
}
