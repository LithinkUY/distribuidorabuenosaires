import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { useSite } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { api, img, fmt, priceOf } from "@/lib/api";

export default function SearchBox() {
  const { settings } = useSite();
  const { currency } = useCart();
  const s = settings.search || {};
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [res, setRes] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef(null);

  useEffect(() => {
    if (q.trim().length < 2) { setRes([]); return; }
    setLoading(true);
    const t = setTimeout(() => api.get("/search", { params: { q } }).then((r) => { setRes(r.data); setOpen(true); setActive(-1); }).finally(() => setLoading(false)), 220);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const f = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", f);
    return () => document.removeEventListener("mousedown", f);
  }, []);

  const go = (p) => { setOpen(false); setQ(""); nav(p ? `/producto/${p.slug}` : `/catalogo?q=${encodeURIComponent(q)}`); };
  const onKey = (e) => {
    if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, res.length - 1));
    if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, -1));
    if (e.key === "Enter") go(active >= 0 ? res[active] : null);
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={box} className="relative w-full max-w-2xl mx-auto" data-testid="search-box">
      <div className="flex items-center gap-2 px-4 h-11" style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: s.radius, color: s.text }}>
        <Search className="w-4 h-4 shrink-0" style={{ color: s.icon }} />
        <input data-testid="search-input" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} onFocus={() => res.length && setOpen(true)}
          placeholder={s.placeholder} className="bg-transparent outline-none flex-1 text-sm placeholder:opacity-60" style={{ color: s.text }} />
        {loading && <Loader2 className="w-4 h-4 animate-spin" style={{ color: s.icon }} />}
      </div>
      {open && q.length >= 2 && (
        <div data-testid="search-dropdown" className="absolute left-0 right-0 top-full mt-2 shadow-2xl z-50 overflow-hidden border"
          style={{ background: s.dropdown_bg, borderColor: s.border, borderRadius: Math.min(s.radius ?? 8, 16), color: s.text }}>
          {res.length === 0 && <div className="p-4 text-sm opacity-60" data-testid="search-empty">Sin resultados para “{q}”</div>}
          {res.map((p, i) => {
            const pr = priceOf(p.min_variant, currency);
            return (
              <button key={p.id} data-testid={`search-result-${p.slug}`} onMouseDown={() => go(p)} onMouseEnter={() => setActive(i)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors" style={active === i ? { background: s.bg } : {}}>
                <img src={img(p.image)} alt="" className="w-12 h-12 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs opacity-60 uppercase tracking-wide">{p.brand}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold">{fmt(pr.final, currency)}</div>
                  <div className={`text-[11px] font-semibold ${p.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>{p.stock > 0 ? `Stock: ${p.stock}` : "Sin stock"}</div>
                </div>
              </button>
            );
          })}
          {res.length > 0 && <button onMouseDown={() => go(null)} className="w-full text-center text-xs font-semibold py-2.5 border-t uppercase tracking-wider" style={{ borderColor: s.border }} data-testid="search-see-all">Ver todos los resultados</button>}
        </div>
      )}
    </div>
  );
}
