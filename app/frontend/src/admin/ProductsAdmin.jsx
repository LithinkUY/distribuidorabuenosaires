import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Save, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { api, img, fmt, errMsg } from "@/lib/api";
import { PageHeader, Panel, Btn, Loading } from "@/admin/ui";

function QuickEdit({ products, reload }) {
  const [rows, setRows] = useState({});
  const ch = (p, v, k, val) => setRows((r) => ({ ...r, [v.id]: { product_id: p.id, variant_id: v.id, ...(r[v.id] || {}), [k]: val } }));
  const saveAll = async () => {
    try { await api.post("/admin/variants/quick", Object.values(rows)); toast.success(`${Object.keys(rows).length} variantes actualizadas`); setRows({}); reload(); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const cell = (p, v, k, step = "1") => (
    <input type="number" step={step} defaultValue={v[k]} onChange={(e) => ch(p, v, k, e.target.value)} data-testid={`quick-${k}-${v.sku}`}
      className={`w-24 border rounded px-2 py-1 text-sm ${rows[v.id]?.[k] !== undefined ? "border-amber-400 bg-amber-50" : "border-zinc-200"}`} />
  );
  return (
    <Panel title="Edición rápida de stock y precios" actions={<Btn onClick={saveAll} disabled={!Object.keys(rows).length} data-testid="quick-save-btn"><Save className="w-4 h-4" />Guardar ({Object.keys(rows).length})</Btn>}>
      <div className="overflow-x-auto"><table className="w-full text-sm" data-testid="quick-edit-table">
        <thead><tr className="text-left text-zinc-500 border-b"><th className="py-2">Producto / Variante</th><th>SKU</th><th>Stock</th><th>Precio USD</th><th>Oferta USD</th><th>ARS calculado</th></tr></thead>
        <tbody>{products.flatMap((p) => p.variants.map((v) => (
          <tr key={v.id} className="border-b border-zinc-100">
            <td className="py-2"><b>{p.name}</b><div className="text-xs text-zinc-500">{Object.values(v.attrs || {}).join(" / ")}</div></td>
            <td className="font-mono text-xs">{v.sku}</td><td>{cell(p, v, "stock")}</td><td>{cell(p, v, "price_usd", "0.01")}</td><td>{cell(p, v, "sale_usd", "0.01")}</td>
            <td className="text-xs">{fmt(v.sale_ars || v.price_ars, "ARS")}{v.ars_manual && <span className="ml-1 text-amber-600">(manual)</span>}</td>
          </tr>)))}</tbody></table></div>
    </Panel>
  );
}

export default function ProductsAdmin() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("list");
  const load = () => api.get("/products", { params: { include_inactive: true, limit: 1000 } }).then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const del = async (p) => { if (!window.confirm(`¿Eliminar ${p.name}?`)) return; await api.delete(`/admin/products/${p.id}`); toast.success("Producto eliminado"); load(); };

  const toggleFlag = async (p, patch, msg) => {
    setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, ...patch } : x)));
    try {
      const { data } = await api.put(`/admin/products/${p.id}/flags`, patch);
      setItems((prev) => prev.map((x) => (x.id === p.id ? data : x)));
      if (msg) toast.success(msg);
    } catch (e) {
      toast.error(errMsg(e));
      load();
    }
  };

  if (!items) return <Loading />;
  const list = items.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.variants.some((v) => v.sku?.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-6" data-testid="products-admin">
      <PageHeader title="Productos y stock" desc={`${items.length} productos · Usá la estrella ★ para Destacados y el switch para Ofertas`}><Link to="/admin/productos/nuevo"><Btn data-testid="product-new-btn"><Plus className="w-4 h-4" />Nuevo producto</Btn></Link></PageHeader>
      <div className="flex gap-2 items-center">
        {[["list", "Listado"], ["quick", "Edición rápida"]].map(([k, l]) => <Btn key={k} variant={tab === k ? "dark" : "outline"} onClick={() => setTab(k)} data-testid={`products-tab-${k}`}>{l}</Btn>)}
        <div className="ml-auto flex items-center gap-2 bg-white border rounded-md px-3"><Search className="w-4 h-4 text-zinc-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o SKU" className="py-2 text-sm outline-none" data-testid="products-search" /></div>
      </div>
      {tab === "quick" ? <QuickEdit products={list} reload={load} /> : (
        <Panel>
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 border-b">
                <th className="py-2">Producto</th>
                <th className="text-center">Destacado</th>
                <th className="text-center">¿Oferta?</th>
                <th className="text-center">Lanzamiento</th>
                <th>Categoría</th>
                <th>Variantes</th>
                <th>Stock</th>
                <th>Desde</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>{list.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100" data-testid={`product-row-${p.slug}`}>
                <td className="py-2.5">
                  <div className="flex items-center gap-3">
                    <img src={img(p.images[0])} alt="" className="w-10 h-10 rounded object-cover shrink-0 bg-zinc-100" />
                    <div>
                      <b className="block leading-snug">{p.name}</b>
                      {p.brand && <span className="text-xs text-zinc-400">{p.brand}</span>}
                    </div>
                  </div>
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    onClick={() => toggleFlag(p, { featured: !p.featured }, !p.featured ? "Agregado a Destacados del Home" : "Quitado de Destacados")}
                    data-testid={`product-featured-${p.slug}`}
                    title={p.featured ? "Quitar de Destacados" : "Destacar en el Home"}
                    className="p-1.5 rounded-full hover:bg-amber-50 transition-transform active:scale-90 inline-flex items-center justify-center"
                  >
                    <Star className={`w-5 h-5 transition-colors ${p.featured ? "fill-amber-400 text-amber-400" : "text-zinc-300 hover:text-amber-400"}`} />
                  </button>
                </td>
                <td className="text-center">
                  <div className="inline-flex items-center gap-2 justify-center">
                    <Switch
                      checked={!!p.on_sale}
                      onCheckedChange={(v) => toggleFlag(p, { on_sale: v }, v ? "Activado como Oferta en toda la tienda" : "Oferta desactivada")}
                      data-testid={`product-sale-${p.slug}`}
                    />
                    {p.on_sale && <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">OFERTA</span>}
                  </div>
                </td>
                <td className="text-center">
                  <div className="inline-flex items-center gap-1.5 justify-center">
                    <Switch
                      checked={p.lanzamiento !== false}
                      onCheckedChange={(v) => toggleFlag(p, { lanzamiento: v }, v ? "Activado en Lanzamientos" : "Quitado de Lanzamientos")}
                      data-testid={`product-launch-${p.slug}`}
                    />
                  </div>
                </td>
                <td>{p.category}{p.subcategory && ` › ${p.subcategory}`}</td>
                <td>{p.variants.length}</td>
                <td className={p.stock_total <= 5 ? "text-red-600 font-bold" : ""}>{p.stock_total}</td>
                <td>{fmt(p.min_variant?.sale_usd || p.min_variant?.price_usd, "USD")}<div className="text-xs text-zinc-500">{fmt(p.min_variant?.sale_ars || p.min_variant?.price_ars, "ARS")}</div></td>
                <td>
                  <button
                    type="button"
                    onClick={() => toggleFlag(p, { active: !p.active }, !p.active ? "Producto publicado" : "Producto oculto")}
                    className="cursor-pointer"
                  >
                    {p.active ? <span className="text-emerald-600 text-xs font-bold">ACTIVO</span> : <span className="text-zinc-400 text-xs font-bold">OCULTO</span>}
                  </button>
                </td>
                <td className="text-right whitespace-nowrap"><Link to={`/admin/productos/${p.id}`} className="inline-flex p-2" data-testid="product-edit-btn"><Pencil className="w-4 h-4" /></Link>
                  <button onClick={() => del(p)} className="p-2 text-red-600" data-testid="product-delete-btn"><Trash2 className="w-4 h-4" /></button></td>
              </tr>))}</tbody></table></div>
        </Panel>
      )}
    </div>
  );
}
