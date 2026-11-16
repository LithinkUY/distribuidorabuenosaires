import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Music2, MessageCircle, X } from "lucide-react";
import { useSite } from "@/context/ThemeContext";
import { img } from "@/lib/api";
import { Logo } from "@/store/Header";

const ICONS = { instagram: Instagram, facebook: Facebook, youtube: Youtube, tiktok: Music2 };

export function Footer() {
  const { settings } = useSite();
  const f = settings.footer || {};
  const style = { background: f.bg || "var(--bg-footer)", color: f.text || "var(--footer-text)" };
  return (
    <footer data-testid="store-footer" style={style} className="mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4 space-y-4">
          <Logo settings={settings} dark />
          <p className="text-sm opacity-70 leading-relaxed">{f.about}</p>
          <p className="text-sm opacity-70">{f.contact}</p>
          <div className="flex gap-3">
            {Object.entries(f.socials || {}).filter(([, u]) => u).map(([k, u]) => {
              const I = ICONS[k] || MessageCircle;
              return <a key={k} href={u} target="_blank" rel="noreferrer" data-testid={`social-${k}`} className="w-9 h-9 grid place-items-center border border-current/30 rounded-full hover:opacity-70"><I className="w-4 h-4" /></a>;
            })}
          </div>
        </div>
        {(f.columns || []).map((c) => (
          <div key={c.id} className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">{c.title}</h4>
            <ul className="space-y-2.5 text-sm opacity-75">
              {(c.links || []).map((l) => <li key={l.id}><Link to={l.url} className="hover:opacity-100 hover:underline">{l.label}</Link></li>)}
            </ul>
          </div>
        ))}
        {f.map_enabled && f.map_iframe && (
          <div className="md:col-span-4 md:col-start-auto">
            <iframe data-testid="footer-map" title="Mapa" src={f.map_iframe} className="w-full h-48 border-0" style={{ borderRadius: "var(--radius)" }} loading="lazy" />
          </div>
        )}
      </div>
      <div className="border-t border-current/10 text-xs opacity-60 text-center py-5 px-4" data-testid="footer-legal">{f.legal}</div>
    </footer>
  );
}

export const waLink = (number, text) => `https://wa.me/${String(number || "").replace(/\D/g, "")}?text=${encodeURIComponent(text || "")}`;

export function WhatsAppFloat() {
  const { settings } = useSite();
  const w = settings.whatsapp || {};
  const [bubble, setBubble] = useState(true);
  if (!w.enabled || !w.number) return null;
  const side = w.position === "left" ? "left-5" : "right-5";
  return (
    <div className={`fixed bottom-5 ${side} z-40 flex items-center gap-3 ${w.position === "left" ? "flex-row-reverse" : ""}`}>
      {bubble && w.bubble && (
        <div className="bg-white text-zinc-800 text-sm shadow-lg px-4 py-2 rounded-2xl flex items-center gap-2 fade-up" data-testid="whatsapp-bubble">
          {w.bubble}<button onClick={() => setBubble(false)}><X className="w-3 h-3" /></button>
        </div>
      )}
      <a href={waLink(w.number, w.message)} target="_blank" rel="noreferrer" data-testid="whatsapp-float"
        className="w-14 h-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-xl hover:scale-105 transition-transform">
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
}

export function PromoPopup() {
  const { settings } = useSite();
  const p = settings.popup || {};
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!p.enabled || sessionStorage.getItem("popup-seen")) return;
    const t = setTimeout(() => setShow(true), (p.delay || 1) * 1000);
    return () => clearTimeout(t);
  }, [p.enabled, p.delay]);
  const close = () => { sessionStorage.setItem("popup-seen", "1"); setShow(false); };
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 grid place-items-center p-4" onClick={close} data-testid="promo-popup">
      <div className="card-theme overflow-hidden max-w-3xl w-full grid sm:grid-cols-2 fade-up text-ink" onClick={(e) => e.stopPropagation()}>
        {p.image && <img src={img(p.image)} alt="" className="w-full h-56 sm:h-full object-cover" />}
        <div className="p-8 flex flex-col justify-center gap-4 relative">
          <button onClick={close} className="absolute top-3 right-3" data-testid="promo-popup-close"><X className="w-5 h-5" /></button>
          <h3 className="text-2xl sm:text-3xl font-bold leading-tight">{p.title}</h3>
          <p className="text-ink-muted">{p.text}</p>
          {p.btn_text && <Link to={p.btn_link || "/"} onClick={close} className="btn-theme px-6 py-3 text-center font-semibold" data-testid="promo-popup-cta">{p.btn_text}</Link>}
        </div>
      </div>
    </div>
  );
}
