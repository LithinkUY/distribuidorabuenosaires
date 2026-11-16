import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { api, fmt, errMsg, uid } from "@/lib/api";
import { PageHeader, Panel, Text, Area, Select, Toggle, ImageField, ImagesField, SaveBtn, Btn, Loading, inputCls } from "@/admin/ui";

const EMPTY = { name: "", slug: "", description: "<p></p>", specs: [], category_id: "", subcategory_id: "", brand_id: "", type_id: "", images: [], tags: ["lanzamientos"], active: true, featured: false, on_sale: false, lanzamiento: true,
  variants: [{ id: uid(), attrs: { Medida: "Única" }, sku: "", price_usd: 0, sale_usd: 0, ars_manual: false, price_ars: 0, sale_ars: 0, stock: 0, image: "" }] };

function VariantRow({ v, opts, rate, up, remove, dup }) {
  const n = (k) => <input type="number" step="0.01" value={v[k] ?? 0} onChange={(e) => up({ [k]: e.target.value })} className={inputCls} data-testid={`variant-${k}`} />;
  return (
    <div className="border border-zinc-200 rounded-lg p-4 space-y-3" data-testid="variant-row">
      <div className="flex flex-wrap gap-3 items-end">
        {opts.map((o) => <label key={o} className="text-sm flex-1 min-w-[120px]"><span className="font-medium text-zinc-700">{o}</span>
          <input value={v.attrs?.[o] || ""} onChange={(e) => up({ attrs: { ...v.attrs, [o]: e.target.value } })} className={inputCls} data-testid={`variant-attr-${o}`} /></label>)}
        <label className="text-sm w-36"><span className="font-medium text-zinc-700">SKU</span><input value={v.sku} onChange={(e) => up({ sku: e.target.value })} className={inputCls} data-testid="variant-sku" /></label>
        <label className="text-sm w-24"><span className="font-medium text-zinc-700">Stock</span><input type="number" value={v.stock} onChange={(e) => up({ stock: e.target.value })} className={inputCls} data-testid="variant-stock" /></label>
        <Btn variant="outline" onClick={dup} title="Duplicar"><Copy className="w-4 h-4" /></Btn><Btn variant="danger" onClick={remove} data-testid="variant-delete"><Trash2 className="w-4 h-4" /></Btn>
      </div>
      <div className="grid sm:grid-cols-[1fr_1fr_auto_1fr_1fr_auto] gap-3 items-end text-sm">
        <label><span className="font-medium text-zinc-700">Precio USD</span>{n("price_usd")}</label>
        <label><span className="font-medium text-zinc-700">Oferta USD (0 = sin oferta)</span>{n("sale_usd")}</label>
        <label className="flex items-center gap-2 pb-2"><input type="checkbox" checked={!!v.ars_manual} onChange={(e) => up({ ars_manual: e.target.checked, price_ars: v.price_ars || Math.round(v.price_usd * rate), sale_ars: v.sale_ars || Math.round(v.sale_usd * rate) })} data-testid="variant-ars-manual" />ARS manual</label>
        {v.ars_manual ? <><label><span className="font-medium text-zinc-700">Precio ARS</span>{n("price_ars")}</label><label><span className="font-medium text-zinc-700">Oferta ARS</span>{n("sale_ars")}</label></>
          : <div className="sm:col-span-2 text-xs text-zinc-500 pb-2" data-testid="variant-ars-auto">Auto: {fmt(v.price_usd * rate, "ARS")}{Number(v.sale_usd) > 0 && ` · oferta ${fmt(v.sale_usd * rate, "ARS")}`} (cotización {rate})</div>}
        <ImageField small label="Imagen" value={v.image} onChange={(val) => up({ image: val })} tid={`variant-img-${v.id}`} />
      </div>
    </div>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const isNew = id === "nuevo";
  const [p, setP] = useState(isNew ? structuredClone(EMPTY) : null);
  const [tax, setTax] = useState({ cats: [], brands: [], types: [] });
  const [rate, setRate] = useState(1);
  const [opts, setOpts] = useState(["Medida", "Color"]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/categories"), api.get("/brands"), api.get("/types"), api.get("/settings")]).then(([c, b, t, s]) => { setTax({ cats: c.data, brands: b.data, types: t.data }); setRate(s.data.usd_rate); });
    if (!isNew) api.get(`/products/${id}`).then((r) => { setP(r.data); const keys = [...new Set(r.data.variants.flatMap((v) => Object.keys(v.attrs || {})))]; if (keys.length) setOpts(keys); });
  }, [id, isNew]);
  if (!p) return <Loading />;
  const set = (k, v) => setP({ ...p, [k]: v });
  const upV = (vid, patch) => set("variants", p.variants.map((v) => (v.id === vid ? { ...v, ...patch } : v)));
  const parents = tax.cats.filter((c) => !c.parent_id);
  const subs = tax.cats.filter((c) => c.parent_id === p.category_id);

  const save = async () => {
    if (!p.name.trim() || !p.category_id) return toast.error("Nombre y categoría son obligatorios");
    if (!p.variants.length) return toast.error("Agregá al menos una variante");
    setSaving(true);
    const variants = p.variants.map((v) => ({ ...v, attrs: Object.fromEntries(opts.map((o) => [o, v.attrs?.[o] || ""]).filter(([, x]) => x)) }));
    try {
      const body = { ...p, variants, subcategory_id: p.subcategory_id || null };
      const { data } = isNew ? await api.post("/admin/products", body) : await api.put(`/admin/products/${id}`, body);
      toast.success("Producto guardado");
      nav(`/admin/productos/${data.id}`, { replace: true });
      setP(data);
    } catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6" data-testid="product-form">
      <PageHeader title={isNew ? "Nuevo producto" : p.name}><Btn variant="outline" onClick={() => nav("/admin/productos")}>Volver</Btn><SaveBtn onClick={save} saving={saving} tid="product-save-btn" /></PageHeader>
      <div className="grid xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <Panel title="Información">
            <div className="grid sm:grid-cols-2 gap-4"><Text label="Nombre *" value={p.name} onChange={(v) => set("name", v)} tid="product-name-input" /><Text label="Slug" value={p.slug} onChange={(v) => set("slug", v)} hint="Vacío = automático" tid="product-slug-input" /></div>
            <div className="grid lg:grid-cols-2 gap-4">
              <Area label="Descripción (HTML enriquecido)" value={p.description} onChange={(v) => set("description", v)} rows={8} mono tid="product-description-input" />
              <div><p className="text-sm font-medium text-zinc-700 mb-1">Vista previa</p><div className="rich border rounded-lg p-3 h-[186px] overflow-auto text-sm bg-zinc-50" dangerouslySetInnerHTML={{ __html: p.description }} /></div>
            </div>
          </Panel>
          <Panel title="Imágenes"><ImagesField value={p.images} onChange={(v) => set("images", v)} tid="product-images" /></Panel>
          <Panel title={`Variantes (${p.variants.length})`} actions={<Btn variant="outline" data-testid="add-variant-btn" onClick={() => set("variants", [...p.variants, { id: uid(), attrs: {}, sku: "", price_usd: 0, sale_usd: 0, ars_manual: false, price_ars: 0, sale_ars: 0, stock: 0, image: "" }])}><Plus className="w-4 h-4" />Agregar variante</Btn>}>
            <Text label="Atributos de variante (separados por coma)" value={opts.join(", ")} onChange={(v) => setOpts(v.split(",").map((x) => x.trim()).filter(Boolean))} tid="variant-options-input" hint="Ej: Medida, Color, Tipo" />
            {p.variants.map((v) => <VariantRow key={v.id} v={v} opts={opts} rate={rate} up={(patch) => upV(v.id, patch)} remove={() => set("variants", p.variants.filter((x) => x.id !== v.id))} dup={() => set("variants", [...p.variants, { ...v, id: uid(), sku: v.sku + "-2" }])} />)}
          </Panel>
          <Panel title="Especificaciones" actions={<Btn variant="outline" onClick={() => set("specs", [...p.specs, { key: "", value: "" }])} data-testid="add-spec-btn"><Plus className="w-4 h-4" />Fila</Btn>}>
            {p.specs.map((s, i) => (
              <div key={i} className="flex gap-2"><input value={s.key} placeholder="Característica" onChange={(e) => set("specs", p.specs.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))} className={inputCls} />
                <input value={s.value} placeholder="Valor" onChange={(e) => set("specs", p.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} className={inputCls} />
                <Btn variant="danger" onClick={() => set("specs", p.specs.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Btn></div>))}
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Organización">
            <Toggle label="Visible en la tienda" checked={p.active} onChange={(v) => set("active", v)} tid="product-active" />
            <div className="border-t border-b border-zinc-100 py-2 my-2 space-y-1">
              <Toggle label="★ Destacado (Home)" checked={!!p.featured} onChange={(v) => set("featured", v)} tid="product-featured" />
              <Toggle label="¿Oferta? (Home y tienda)" checked={!!p.on_sale} onChange={(v) => set("on_sale", v)} tid="product-on-sale" />
              <Toggle label="Lanzamiento (por defecto)" checked={p.lanzamiento !== false} onChange={(v) => set("lanzamiento", v)} tid="product-lanzamiento" />
            </div>
            <Select label="Categoría *" value={p.category_id} onChange={(v) => setP({ ...p, category_id: v, subcategory_id: "" })} tid="product-category" options={[{ value: "", label: "Elegir…" }, ...parents.map((c) => ({ value: c.id, label: c.name }))]} />
            <Select label="Subcategoría" value={p.subcategory_id || ""} onChange={(v) => set("subcategory_id", v)} tid="product-subcategory" options={[{ value: "", label: "Ninguna" }, ...subs.map((c) => ({ value: c.id, label: c.name }))]} />
            <Select label="Marca" value={p.brand_id} onChange={(v) => set("brand_id", v)} tid="product-brand" options={[{ value: "", label: "Sin marca" }, ...tax.brands.map((c) => ({ value: c.id, label: c.name }))]} />
            <Select label="Tipo de producto" value={p.type_id} onChange={(v) => set("type_id", v)} tid="product-type" options={[{ value: "", label: "Sin tipo" }, ...tax.types.map((c) => ({ value: c.id, label: c.name }))]} />
            <Text label="Etiquetas (coma)" value={(p.tags || []).join(", ")} onChange={(v) => set("tags", v.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean))} tid="product-tags" hint="Usadas por las secciones del Home: ofertas, destacados, lanzamientos…" />
          </Panel>
        </div>
      </div>
    </div>
  );
}
