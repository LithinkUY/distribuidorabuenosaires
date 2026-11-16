import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, MessageCircle, Truck, ShieldCheck } from "lucide-react";
import { api, img, fmt, priceOf } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useSite } from "@/context/ThemeContext";
import { waLink } from "@/store/Footer";

function Gallery({ images, active, setActive }) {
  const [zoom, setZoom] = useState(null);
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3">
      <div className="flex sm:flex-col gap-2 overflow-auto no-scrollbar">
        {images.map((src, i) => (
          <button key={src + i} onClick={() => setActive(src)} data-testid={`gallery-thumb-${i}`}
            className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden border-2 transition-colors ${active === src ? "border-[var(--primary)]" : "border-transparent"}`} style={{ borderRadius: "var(--radius)" }}>
            <img src={img(src)} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      <div data-testid="gallery-main" className="relative flex-1 aspect-square overflow-hidden bg-brand2 cursor-zoom-in" style={{ borderRadius: "var(--radius)" }}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
        onMouseLeave={() => setZoom(null)}>
        <img src={img(active)} alt="" className="w-full h-full object-cover transition-transform duration-200"
          style={zoom ? { transform: "scale(2.2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : {}} />
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const { currency, add } = useCart();
  const { settings } = useSite();
  const [p, setP] = useState(null);
  const [sel, setSel] = useState({});
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    api.get(`/products/${slug}`).then((r) => {
      setP(r.data);
      const first = r.data.variants.find((v) => v.stock > 0) || r.data.variants[0];
      setSel(first?.attrs || {});
      setActive(first?.image || r.data.images[0]);
    }).catch(() => setErr(true));
  }, [slug]);

  const options = useMemo(() => {
    const o = {};
    (p?.variants || []).forEach((v) => Object.entries(v.attrs || {}).forEach(([k, val]) => { o[k] = o[k] || []; if (!o[k].includes(val)) o[k].push(val); }));
    return o;
  }, [p]);
  const variant = p?.variants.find((v) => Object.entries(sel).every(([k, val]) => v.attrs?.[k] === val));
  const exists = (k, val) => p.variants.some((v) => v.attrs?.[k] === val && Object.entries(sel).every(([kk, vv]) => kk === k || v.attrs?.[kk] === vv));

  const choose = (k, val) => {
    let next = { ...sel, [k]: val };
    if (!p.variants.some((v) => Object.entries(next).every(([kk, vv]) => v.attrs?.[kk] === vv))) next = (p.variants.find((v) => v.attrs?.[k] === val) || {}).attrs || next;
    setSel(next);
    const nv = p.variants.find((v) => Object.entries(next).every(([kk, vv]) => v.attrs?.[kk] === vv));
    if (nv?.image) setActive(nv.image);
    setQty(1);
  };

  if (err) return <div className="py-32 text-center" data-testid="product-not-found">Producto no encontrado. <Link to="/catalogo" className="underline">Volver al catálogo</Link></div>;
  if (!p) return <div className="py-32 text-center text-ink-muted">Cargando…</div>;
  const pr = priceOf(variant, currency);
  const other = currency === "ARS" ? "USD" : "ARS";
  const images = [...new Set([...(p.images || []), ...p.variants.map((v) => v.image).filter(Boolean)])];
  const wa = settings.whatsapp || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="product-page">
      <nav className="text-xs text-ink-muted mb-6"><Link to="/">Inicio</Link> / <Link to="/catalogo">{p.category}</Link>{p.subcategory && ` / ${p.subcategory}`}</nav>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <Gallery images={images} active={active} setActive={setActive} />
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-ink-muted" data-testid="product-brand">{p.brand}</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-2" data-testid="product-name">{p.name}</h1>
            <p className="text-xs text-ink-muted mt-2">SKU: <span data-testid="product-sku">{variant?.sku || "-"}</span></p>
          </div>
          <div>
            {(p.on_sale || pr.sale > 0) && (
              <div className="flex items-center gap-3 mb-1">
                {pr.sale > 0 && <span className="line-through text-ink-muted" data-testid="product-regular-price">{fmt(pr.regular, currency)}</span>}
                <span className="bg-sale text-white text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider" style={{ borderRadius: "var(--radius)" }}>
                  {p.on_sale && pr.pct > 0 ? `OFERTA · ${pr.pct}% OFF` : p.on_sale ? "OFERTA" : `${pr.pct}% OFF`}
                </span>
              </div>
            )}
            <div className="text-4xl font-extrabold" data-testid="product-price">{fmt(pr.final, currency)}</div>
            <div className="text-sm text-ink-muted" data-testid="product-price-alt">≈ {fmt(priceOf(variant, other).final, other)}</div>
          </div>
          {Object.entries(options).map(([k, vals]) => (
            <div key={k}>
              <p className="text-sm font-semibold mb-2">{k}: <span className="font-normal">{sel[k]}</span></p>
              <div className="flex flex-wrap gap-2">
                {vals.map((val) => (
                  <button key={val} data-testid={`variant-opt-${k}-${val}`} onClick={() => choose(k, val)}
                    className={`px-4 py-2 text-sm border transition-colors ${sel[k] === val ? "bg-[var(--primary)] text-[var(--btn-text)] border-[var(--primary)]" : "border-line hover:border-[var(--primary)]"} ${!exists(k, val) ? "opacity-40" : ""}`}
                    style={{ borderRadius: "var(--radius)" }}>{val}</button>
                ))}
              </div>
            </div>
          ))}
          <p data-testid="product-stock" className={`text-sm font-semibold ${variant?.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
            {!variant ? "Combinación no disponible" : variant.stock > 0 ? `${variant.stock} unidades disponibles` : "Sin stock en esta variante"}
          </p>
          <div className="flex gap-3">
            <div className="flex items-center border border-line" style={{ borderRadius: "var(--radius)" }}>
              <button className="px-3 py-3" onClick={() => setQty(Math.max(1, qty - 1))} data-testid="product-qty-minus"><Minus className="w-4 h-4" /></button>
              <span className="w-8 text-center font-semibold" data-testid="product-qty">{qty}</span>
              <button className="px-3 py-3" onClick={() => setQty(Math.min(variant?.stock || 1, qty + 1))} data-testid="product-qty-plus"><Plus className="w-4 h-4" /></button>
            </div>
            <button data-testid="add-to-cart-btn" disabled={!variant || variant.stock <= 0} onClick={() => add(p, variant, qty)} className="btn-theme flex-1 py-3.5 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Agregar al carrito
            </button>
          </div>
          {wa.number && <a data-testid="product-wa-btn" href={waLink(wa.number, `Hola! Consulta por ${p.name} (${variant?.sku || ""})`)} target="_blank" rel="noreferrer" className="btn-outline-theme w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold"><MessageCircle className="w-4 h-4" />Consultar por WhatsApp</a>}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="card-theme p-3 flex gap-2 items-center"><Truck className="w-4 h-4" />Envío gratis desde {fmt(settings.shipping?.free_over, "ARS")}</div>
            <div className="card-theme p-3 flex gap-2 items-center"><ShieldCheck className="w-4 h-4" />Compra protegida</div>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-10 mt-16">
        <div><h2 className="text-xl font-bold mb-4">Descripción</h2><div className="rich text-ink-muted" data-testid="product-description" dangerouslySetInnerHTML={{ __html: p.description }} /></div>
        {p.specs?.length > 0 && <div><h2 className="text-xl font-bold mb-4">Especificaciones</h2>
          <table className="w-full text-sm card-theme overflow-hidden" data-testid="product-specs"><tbody>
            {p.specs.map((s, i) => <tr key={i} className="border-b border-line last:border-0"><td className="p-3 font-semibold w-1/3">{s.key}</td><td className="p-3">{s.value}</td></tr>)}
          </tbody></table></div>}
      </div>
    </div>
  );
}
