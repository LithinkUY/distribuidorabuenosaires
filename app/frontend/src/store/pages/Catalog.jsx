import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/store/ProductCard";

function Group({ title, children }) {
  return <div className="border-b border-line pb-5 mb-5"><h4 className="text-xs font-bold uppercase tracking-[0.18em] mb-3">{title}</h4>{children}</div>;
}

export default function Catalog() {
  const [sp, setSp] = useSearchParams();
  const { currency } = useCart();
  const [items, setItems] = useState(null);
  const [tax, setTax] = useState({ cats: [], brands: [], types: [] });
  const [range, setRange] = useState({ min: sp.get("min") || "", max: sp.get("max") || "" });
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/categories"), api.get("/brands"), api.get("/types")]).then(([c, b, t]) => setTax({ cats: c.data, brands: b.data, types: t.data }));
  }, []);
  useEffect(() => {
    const params = { currency, sort: sp.get("sort") || "new" };
    ["category", "brand", "type", "tag", "q"].forEach((k) => sp.get(k) && (params[k] = sp.get(k)));
    if (sp.get("stock")) params.in_stock = true;
    if (sp.get("min")) params.min_price = sp.get("min");
    if (sp.get("max")) params.max_price = sp.get("max");
    setItems(null);
    api.get("/products", { params }).then((r) => setItems(r.data));
  }, [sp, currency]);

  const setP = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n); };
  const toggle = (k, v) => setP(k, sp.get(k) === v ? "" : v);
  const parents = tax.cats.filter((c) => !c.parent_id);
  const opt = (k, v, label, tid) => (
    <label key={v} className="flex items-center gap-2 text-sm py-1 cursor-pointer" data-testid={tid}>
      <input type="checkbox" checked={sp.get(k) === v} onChange={() => toggle(k, v)} className="accent-[var(--primary)]" />{label}
    </label>
  );

  const filters = (
    <div data-testid="catalog-filters">
      <Group title="Categorías">
        {parents.map((c) => (
          <div key={c.id}>
            {opt("category", c.slug, c.name, `filter-cat-${c.slug}`)}
            <div className="pl-5">{tax.cats.filter((s) => s.parent_id === c.id).map((s) => opt("category", s.slug, s.name, `filter-cat-${s.slug}`))}</div>
          </div>
        ))}
      </Group>
      <Group title="Marca">{tax.brands.map((b) => opt("brand", b.slug, b.name, `filter-brand-${b.slug}`))}</Group>
      <Group title="Tipo">{tax.types.map((t) => opt("type", t.slug, t.name, `filter-type-${t.slug}`))}</Group>
      <Group title="Disponibilidad">{opt("stock", "1", "Solo con stock", "filter-stock")}</Group>
      <Group title={`Precio (${currency})`}>
        <div className="flex gap-2">
          <input data-testid="filter-min" value={range.min} onChange={(e) => setRange({ ...range, min: e.target.value })} placeholder="Mín" type="number" className="input-theme w-full px-2 py-1.5 text-sm" />
          <input data-testid="filter-max" value={range.max} onChange={(e) => setRange({ ...range, max: e.target.value })} placeholder="Máx" type="number" className="input-theme w-full px-2 py-1.5 text-sm" />
        </div>
        <button data-testid="filter-price-apply" onClick={() => { const n = new URLSearchParams(sp); range.min ? n.set("min", range.min) : n.delete("min"); range.max ? n.set("max", range.max) : n.delete("max"); setSp(n); }} className="btn-theme w-full mt-2 py-2 text-xs font-bold uppercase">Aplicar</button>
      </Group>
      <button data-testid="filter-clear" onClick={() => { setSp({}); setRange({ min: "", max: "" }); }} className="text-xs underline">Limpiar filtros</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="catalog-page">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{sp.get("q") ? `Resultados para “${sp.get("q")}”` : sp.get("tag") ? sp.get("tag").replace(/^\w/, (c) => c.toUpperCase()) : "Catálogo"}</h1>
          <p className="text-sm text-ink-muted mt-1" data-testid="catalog-count">{items ? `${items.length} productos` : "Cargando…"}</p>
        </div>
        <div className="flex gap-2">
          <button className="lg:hidden btn-outline-theme px-3 py-2 text-sm flex items-center gap-2" onClick={() => setMobile(true)} data-testid="filters-mobile-btn"><SlidersHorizontal className="w-4 h-4" />Filtros</button>
          <select data-testid="catalog-sort" value={sp.get("sort") || "new"} onChange={(e) => setP("sort", e.target.value)} className="input-theme px-3 py-2 text-sm">
            <option value="new">Más nuevos</option><option value="price_asc">Menor precio</option><option value="price_desc">Mayor precio</option><option value="name">Nombre A-Z</option>
          </select>
        </div>
      </div>
      <div className="grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className="hidden lg:block">{filters}</aside>
        <div>
          {items && !items.length && <p className="py-20 text-center text-ink-muted" data-testid="catalog-empty">No encontramos productos con esos filtros.</p>}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">{(items || []).map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </div>
      </div>
      {mobile && <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobile(false)}>
        <div className="bg-surface text-ink w-80 max-w-[85%] h-full p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between mb-4"><b>Filtros</b><button onClick={() => setMobile(false)}><X /></button></div>{filters}
        </div>
      </div>}
    </div>
  );
}
