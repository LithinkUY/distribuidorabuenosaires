import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useSite } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { img, fmt, priceOf } from "@/lib/api";

export default function ProductCard({ p, cfgOverride }) {
  const { settings } = useSite();
  const { currency, add } = useCart();
  const cfg = cfgOverride || settings?.card || {};
  const v = p.min_variant;
  const pr = priceOf(v, currency);
  const other = currency === "ARS" ? "USD" : "ARS";
  const firstStock = p.variants?.find((x) => x.stock > 0);
  return (
    <div data-testid={`product-card-${p.slug}`} className="group card-theme overflow-hidden flex flex-col transition-shadow hover:shadow-xl h-full">
      <Link to={`/producto/${p.slug}`} className="relative block aspect-square overflow-hidden bg-brand2">
        <img src={img(p.images?.[0])} alt={p.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
        <img src={img(p.images?.[1] || p.images?.[0])} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-0 scale-105 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100" />
        {(p.on_sale || (cfg.show_discount && pr.pct > 0)) && (
          <span data-testid="card-discount" className="absolute top-3 left-3 bg-sale text-white text-xs font-bold px-2.5 py-1 uppercase tracking-wider shadow-sm" style={{ borderRadius: "var(--radius)" }}>
            {p.on_sale && pr.pct > 0 ? `OFERTA · ${pr.pct}% OFF` : p.on_sale ? "OFERTA" : `${pr.pct}% OFF`}
          </span>
        )}
        {p.stock_total <= 0 && <span className="absolute top-3 right-3 bg-black/75 text-white text-[11px] font-semibold px-2 py-1 rounded">SIN STOCK</span>}
      </Link>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        {cfg.show_brand && <span className="text-[11px] uppercase tracking-[0.18em] text-ink-muted font-semibold" data-testid="card-brand">{p.brand}</span>}
        <Link to={`/producto/${p.slug}`} className="text-sm font-medium leading-snug line-clamp-2 hover:underline">{p.name}</Link>
        <div className="mt-auto pt-2">
          {pr.sale > 0 && <span className="text-xs text-ink-muted line-through mr-2">{fmt(pr.regular, currency)}</span>}
          <span className="text-lg font-bold" data-testid="card-price">{fmt(pr.final, currency)}</span>
          {cfg.show_dual && <div className="text-xs text-ink-muted" data-testid="card-price-alt">{fmt(priceOf(v, other).final, other)}</div>}
          {cfg.show_stock && <div className={`text-[11px] font-semibold mt-1 ${p.stock_total > 0 ? "text-emerald-600" : "text-red-500"}`} data-testid="card-stock">{p.stock_total > 0 ? `${p.stock_total} unidades disponibles` : "Sin stock"}</div>}
        </div>
        {cfg.show_quick_buy && (
          <button data-testid={`quick-buy-${p.slug}`} disabled={!firstStock} onClick={() => add(p, firstStock)}
            className="btn-theme mt-3 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Compra rápida
          </button>
        )}
      </div>
    </div>
  );
}
