import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Copy, ChevronDown, ChevronUp, Eye, EyeOff, MessageSquare } from "lucide-react";
import { api, uid } from "@/lib/api";
import { PageHeader, Panel, Text, Area, Select, Toggle, ColorField, ImageField, SortableList, SaveBtn, Btn, Loading, useSettings } from "@/admin/ui";

const TYPES = { hero: "Hero Slider", categories: "Grilla de categorías", products: "Sección de productos", banner: "Banner intermedio", text: "Bloque de texto", comments: "Comentarios de clientes" };
const DEFAULTS = {
  hero: { height: 520, width_mode: "full", max_width: 1280, width_pct: 90, rounded: 0, margin_y: 0, object_fit: "cover", autoplay: 6, slides: [] },
  categories: { items: [] },
  products: { source: "tag", value: "destacados", limit: 8, layout: "grid" },
  banner: { image: "", title: "Nuevo banner", text: "", btn_text: "Ver más", link: "/catalogo", height: 320, overlay: 40 },
  text: { html: "<h2>Título</h2><p>Texto del bloque</p>" },
  comments: { subtitle: "Experiencias reales de quienes ya renovaron el interior de su auto", allow_submit: true, limit: 12 },
};

function HeroEditor({ c, up }) {
  const slides = c.slides || [];
  const upSlide = (id, k, v) => up("slides", slides.map((s) => (s.id === id ? { ...s, [k]: v } : s)));
  const wMode = c.width_mode || "full";
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
        <div className="space-y-1">
          <Text label={`Altura (${c.height || 520} px)`} type="number" min={200} max={1000} value={c.height ?? 520} onChange={(v) => up("height", v)} tid="hero-height" />
          <input type="range" min={220} max={900} step={10} value={c.height || 520} onChange={(e) => up("height", Number(e.target.value))} className="w-full accent-zinc-900 cursor-pointer" data-testid="hero-height-range" />
        </div>
        <Select
          label="Ancho del Slider"
          value={wMode}
          onChange={(v) => up("width_mode", v)}
          tid="hero-width-mode"
          options={[
            { value: "full", label: "Pantalla completa (100%)" },
            { value: "contained", label: "Contenedor tienda (1280px)" },
            { value: "custom_px", label: "Personalizado en píxeles (px)" },
            { value: "custom_pct", label: "Personalizado en porcentaje (%)" },
          ]}
        />
        {wMode === "custom_px" && (
          <div className="space-y-1">
            <Text label={`Ancho máx. (${c.max_width || 1280} px)`} type="number" min={400} max={2400} value={c.max_width ?? 1280} onChange={(v) => up("max_width", v)} tid="hero-max-width" />
            <input type="range" min={600} max={1920} step={20} value={c.max_width || 1280} onChange={(e) => up("max_width", Number(e.target.value))} className="w-full accent-zinc-900 cursor-pointer" />
          </div>
        )}
        {wMode === "custom_pct" && (
          <div className="space-y-1">
            <Text label={`Ancho (${c.width_pct || 90}%)`} type="number" min={30} max={100} value={c.width_pct ?? 90} onChange={(v) => up("width_pct", v)} tid="hero-width-pct" />
            <input type="range" min={40} max={100} step={1} value={c.width_pct || 90} onChange={(e) => up("width_pct", Number(e.target.value))} className="w-full accent-zinc-900 cursor-pointer" />
          </div>
        )}
        <Select
          label="Ajuste de imagen"
          value={c.object_fit || "cover"}
          onChange={(v) => up("object_fit", v)}
          tid="hero-object-fit"
          options={[
            { value: "cover", label: "Cubrir todo (Cover)" },
            { value: "contain", label: "Imagen completa (Contain)" },
            { value: "fill", label: "Estirar (Fill)" },
          ]}
        />
        <Text label="Autoplay (segundos, 0 = off)" type="number" value={c.autoplay ?? 6} onChange={(v) => up("autoplay", v)} tid="hero-autoplay" />
        {wMode !== "full" && (
          <>
            <Text label="Bordes redondeados (px)" type="number" min={0} max={48} value={c.rounded ?? 12} onChange={(v) => up("rounded", v)} tid="hero-rounded" />
            <Text label="Margen vertical (px)" type="number" min={0} max={80} value={c.margin_y ?? 16} onChange={(v) => up("margin_y", v)} tid="hero-margin-y" />
          </>
        )}
      </div>
      <SortableList items={slides} onChange={(v) => up("slides", v)} tid="hero-slides" render={(s) => (
        <div className="grid md:grid-cols-[auto_1fr] gap-4">
          <ImageField label="Imagen" value={s.image} onChange={(v) => upSlide(s.id, "image", v)} tid={`slide-img-${s.id}`} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Text label="Título" value={s.title} onChange={(v) => upSlide(s.id, "title", v)} tid="slide-title" />
            <Text label="Subtítulo" value={s.subtitle} onChange={(v) => upSlide(s.id, "subtitle", v)} />
            <Select label="Alineación" value={s.align} onChange={(v) => upSlide(s.id, "align", v)} options={[{ value: "left", label: "Izquierda" }, { value: "center", label: "Centro" }, { value: "right", label: "Derecha" }]} />
            <Text label={`Opacidad overlay (${s.overlay}%)`} type="range" min={0} max={90} value={s.overlay} onChange={(v) => upSlide(s.id, "overlay", Number(v))} />
            <Text label="Texto del botón" value={s.btn_text} onChange={(v) => upSlide(s.id, "btn_text", v)} />
            <Text label="Enlace del botón" value={s.btn_link} onChange={(v) => upSlide(s.id, "btn_link", v)} />
            <ColorField label="Fondo botón" value={s.btn_bg} onChange={(v) => upSlide(s.id, "btn_bg", v)} tid="slide-btn-bg" />
            <ColorField label="Texto botón" value={s.btn_color} onChange={(v) => upSlide(s.id, "btn_color", v)} tid="slide-btn-color" />
          </div>
          <Btn variant="danger" onClick={() => up("slides", slides.filter((x) => x.id !== s.id))}><Trash2 className="w-4 h-4" />Eliminar diapositiva</Btn>
        </div>
      )} />
      <Btn variant="outline" data-testid="add-slide-btn" onClick={() => up("slides", [...slides, { id: uid(), image: "", title: "Nueva diapositiva", subtitle: "", align: "left", overlay: 40, btn_text: "Ver más", btn_link: "/catalogo", btn_bg: "#FFFFFF", btn_color: "#111111" }])}><Plus className="w-4 h-4" />Agregar diapositiva</Btn>
    </div>
  );
}

function CategoriesEditor({ c, up }) {
  const items = c.items || [];
  const upItem = (id, k, v) => up("items", items.map((s) => (s.id === id ? { ...s, [k]: v } : s)));
  const importCats = async () => {
    const { data } = await api.get("/categories");
    up("items", data.filter((x) => !x.parent_id).map((x) => ({ id: uid(), name: x.name, image: x.image, link: `/catalogo?category=${x.slug}` })));
  };
  return (
    <div className="space-y-3">
      <SortableList items={items} onChange={(v) => up("items", v)} tid="cat-items" render={(it) => (
        <div className="flex flex-wrap gap-3 items-end">
          <ImageField small label="Imagen" value={it.image} onChange={(v) => upItem(it.id, "image", v)} tid={`catitem-img-${it.id}`} />
          <div className="flex-1 min-w-[140px]"><Text label="Nombre" value={it.name} onChange={(v) => upItem(it.id, "name", v)} /></div>
          <div className="flex-1 min-w-[140px]"><Text label="Enlace" value={it.link} onChange={(v) => upItem(it.id, "link", v)} /></div>
          <Btn variant="danger" onClick={() => up("items", items.filter((x) => x.id !== it.id))}><Trash2 className="w-4 h-4" /></Btn>
        </div>
      )} />
      <div className="flex gap-2"><Btn variant="outline" data-testid="add-catitem-btn" onClick={() => up("items", [...items, { id: uid(), name: "Nueva", image: "", link: "/catalogo" }])}><Plus className="w-4 h-4" />Agregar ítem</Btn>
        <Btn variant="outline" onClick={importCats}>Importar desde categorías</Btn></div>
    </div>
  );
}

function ProductsEditor({ c, up, tax }) {
  const valueOpts = c.source === "category" ? tax.cats.map((x) => ({ value: x.slug, label: x.name })) : tax.brands.map((x) => ({ value: x.slug, label: x.name }));
  return (
    <div className="grid sm:grid-cols-4 gap-3">
      <Select label="Origen" value={c.source} onChange={(v) => up("source", v)} tid="products-source" options={[{ value: "tag", label: "Etiqueta" }, { value: "category", label: "Categoría" }, { value: "brand", label: "Marca" }, { value: "sale", label: "Con descuento" }, { value: "all", label: "Todos (más nuevos)" }]} />
      {c.source === "tag" && <Text label="Etiqueta (ej: ofertas)" value={c.value} onChange={(v) => up("value", v)} tid="products-value" />}
      {["category", "brand"].includes(c.source) && <Select label="Valor" value={c.value} onChange={(v) => up("value", v)} options={[{ value: "", label: "Elegir…" }, ...valueOpts]} />}
      <Text label="Cantidad máx." type="number" value={c.limit} onChange={(v) => up("limit", v)} />
      <Select label="Diseño" value={c.layout} onChange={(v) => up("layout", v)} options={[{ value: "grid", label: "Grilla" }, { value: "carousel", label: "Carrusel" }]} tid="products-layout" />
    </div>
  );
}

function BannerEditor({ c, up }) {
  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-4">
      <ImageField label="Imagen" value={c.image} onChange={(v) => up("image", v)} tid="banner-img" />
      <div className="grid sm:grid-cols-2 gap-3">
        <Text label="Título" value={c.title} onChange={(v) => up("title", v)} /><Text label="Texto" value={c.text} onChange={(v) => up("text", v)} />
        <Text label="Texto botón" value={c.btn_text} onChange={(v) => up("btn_text", v)} /><Text label="Enlace" value={c.link} onChange={(v) => up("link", v)} />
        <Text label="Altura (px)" type="number" value={c.height} onChange={(v) => up("height", v)} />
        <Text label={`Overlay (${c.overlay}%)`} type="range" min={0} max={90} value={c.overlay} onChange={(v) => up("overlay", Number(v))} />
      </div>
    </div>
  );
}

const EDITORS = {
  hero: HeroEditor,
  categories: CategoriesEditor,
  products: ProductsEditor,
  banner: BannerEditor,
  text: ({ c, up }) => <Area label="HTML" value={c.html} onChange={(v) => up("html", v)} rows={6} mono />,
  comments: ({ c, up }) => (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-3 items-end">
        <Text label="Subtítulo" value={c.subtitle} onChange={(v) => up("subtitle", v)} />
        <Text label="Cantidad máx. a mostrar" type="number" value={c.limit ?? 12} onChange={(v) => up("limit", v)} />
        <Toggle label="Permitir a clientes enviar comentarios" checked={c.allow_submit !== false} onChange={(v) => up("allow_submit", v)} />
      </div>
      <div className="pt-1">
        <Link to="/admin/comentarios" className="inline-flex items-center gap-2 text-xs font-semibold bg-zinc-900 text-white px-3 py-2 rounded-md hover:bg-zinc-800">
          <MessageSquare className="w-3.5 h-3.5" />Ir a Auditar / Gestionar Comentarios
        </Link>
      </div>
    </div>
  ),
};

export default function HomeBuilder() {
  const { s, set, save, saving } = useSettings();
  const [open, setOpen] = useState(null);
  const [tax, setTax] = useState({ cats: [], brands: [] });
  useEffect(() => { Promise.all([api.get("/categories"), api.get("/brands")]).then(([c, b]) => setTax({ cats: c.data, brands: b.data })); }, []);
  if (!s) return <Loading />;
  const secs = s.home_sections || [];
  const upSec = (id, patch) => set("home_sections", secs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const add = (type) => { const n = { id: uid(), type, title: TYPES[type], enabled: true, config: structuredClone(DEFAULTS[type]) }; set("home_sections", [...secs, n]); setOpen(n.id); };

  return (
    <div data-testid="home-builder">
      <PageHeader title="Constructor del Home" desc="Arrastrá para reordenar, activá/desactivá y editá cada sección.">
        <SaveBtn onClick={() => save(["home_sections"])} saving={saving} tid="home-save-btn" />
      </PageHeader>
      <Panel title="Agregar sección">
        <div className="flex flex-wrap gap-2">{Object.entries(TYPES).map(([k, l]) => <Btn key={k} variant="outline" onClick={() => add(k)} data-testid={`add-section-${k}`}><Plus className="w-4 h-4" />{l}</Btn>)}</div>
      </Panel>
      <div className="mt-6">
        <SortableList items={secs} onChange={(v) => set("home_sections", v)} tid="home-sections-list" render={(sec) => {
          const E = EDITORS[sec.type];
          return (
            <div data-testid={`section-row-${sec.id}`}>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase bg-zinc-100 rounded px-2 py-1 shrink-0">{TYPES[sec.type]}</span>
                <input value={sec.title} onChange={(e) => upSec(sec.id, { title: e.target.value })} className="flex-1 font-semibold text-sm outline-none min-w-0" data-testid="section-title-input" />
                <button title="Activar/desactivar" onClick={() => upSec(sec.id, { enabled: !sec.enabled })} data-testid="section-toggle" className={sec.enabled ? "text-emerald-600" : "text-zinc-400"}>{sec.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                <button title="Duplicar" onClick={() => set("home_sections", [...secs, { ...structuredClone(sec), id: uid(), title: sec.title + " (copia)" }])} data-testid="section-duplicate"><Copy className="w-4 h-4" /></button>
                <button title="Eliminar" onClick={() => window.confirm("¿Eliminar sección?") && set("home_sections", secs.filter((x) => x.id !== sec.id))} className="text-red-600" data-testid="section-delete"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => setOpen(open === sec.id ? null : sec.id)} data-testid="section-expand">{open === sec.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
              </div>
              {open === sec.id && E && <div className="mt-4 pt-4 border-t"><E c={sec.config || {}} tax={tax} up={(k, v) => upSec(sec.id, { config: { ...sec.config, [k]: v } })} /></div>}
            </div>
          );
        }} />
      </div>
    </div>
  );
}
