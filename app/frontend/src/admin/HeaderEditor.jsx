import { Plus, Trash2, Search } from "lucide-react";
import { uid } from "@/lib/api";
import { PageHeader, Panel, Text, Toggle, ColorField, SortableList, SaveBtn, Btn, Loading, useSettings } from "@/admin/ui";

function MenuEditor({ items, onChange, depth = 0 }) {
  const up = (id, patch) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  return (
    <div className="space-y-2">
      <SortableList items={items} onChange={onChange} tid={`menu-list-${depth}`} render={(it) => (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <input value={it.label} onChange={(e) => up(it.id, { label: e.target.value })} placeholder="Texto" className="border border-zinc-300 rounded px-2 py-1.5 text-sm flex-1 min-w-[120px]" data-testid="menu-item-label" />
            <input value={it.url} onChange={(e) => up(it.id, { url: e.target.value })} placeholder="/catalogo o https://" className="border border-zinc-300 rounded px-2 py-1.5 text-sm flex-1 min-w-[140px] font-mono" data-testid="menu-item-url" />
            {depth < 2 && <Btn variant="outline" className="!py-1.5" onClick={() => up(it.id, { children: [...(it.children || []), { id: uid(), label: "Submenú", url: "/", children: [] }] })} data-testid="menu-add-child"><Plus className="w-3.5 h-3.5" />Sub</Btn>}
            <Btn variant="danger" className="!py-1.5" onClick={() => onChange(items.filter((x) => x.id !== it.id))} data-testid="menu-item-delete"><Trash2 className="w-3.5 h-3.5" /></Btn>
          </div>
          {it.children?.length > 0 && <div className="pl-4 border-l-2 border-zinc-200"><MenuEditor items={it.children} onChange={(c) => up(it.id, { children: c })} depth={depth + 1} /></div>}
        </div>
      )} />
      {depth === 0 && <Btn variant="outline" onClick={() => onChange([...items, { id: uid(), label: "Nuevo ítem", url: "/", children: [] }])} data-testid="menu-add-item"><Plus className="w-4 h-4" />Agregar ítem al menú</Btn>}
    </div>
  );
}

export default function HeaderEditor() {
  const { s, set, save, saving } = useSettings();
  if (!s) return <Loading />;
  const tb = s.topbar, h = s.header, sr = s.search;
  const msgs = tb.messages || [];
  return (
    <div className="space-y-6" data-testid="header-editor">
      <PageHeader title="Header, menú y buscador" desc="Barra de anuncios, logo, menús multinivel y estilo del buscador.">
        <SaveBtn onClick={() => save(["topbar", "header", "menu", "search"])} saving={saving} tid="header-save-btn" />
      </PageHeader>
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Barra de anuncios (Top Bar)">
          <Toggle label="Mostrar barra" checked={tb.enabled} onChange={(v) => set("topbar.enabled", v)} tid="topbar-enabled" />
          <Toggle label="Texto rotativo (si no, fijo)" checked={tb.rotate} onChange={(v) => set("topbar.rotate", v)} tid="topbar-rotate" />
          <div className="grid grid-cols-2 gap-3"><ColorField label="Fondo" value={tb.bg} onChange={(v) => set("topbar.bg", v)} tid="topbar-bg" /><ColorField label="Texto" value={tb.color} onChange={(v) => set("topbar.color", v)} tid="topbar-color" /></div>
          {msgs.map((m, i) => (
            <div key={i} className="flex gap-2"><input value={m} onChange={(e) => set("topbar.messages", msgs.map((x, j) => (j === i ? e.target.value : x)))} className="border border-zinc-300 rounded px-2 py-1.5 text-sm flex-1" data-testid={`topbar-msg-${i}`} />
              <Btn variant="danger" onClick={() => set("topbar.messages", msgs.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Btn></div>
          ))}
          <Btn variant="outline" onClick={() => set("topbar.messages", [...msgs, "Nuevo anuncio"])} data-testid="topbar-add-msg"><Plus className="w-4 h-4" />Agregar mensaje</Btn>
          <div className="text-[11px] font-semibold tracking-widest uppercase text-center py-2 rounded" style={{ background: tb.bg, color: tb.color }}>{msgs[0] || "Vista previa"}</div>
        </Panel>
        <Panel title="Header">
          <Text label={`Tamaño del logo (alto: ${h.logo_height}px)`} type="range" min={20} max={120} value={h.logo_height} onChange={(v) => set("header.logo_height", Number(v))} tid="header-logo-height" />
          <ColorField label="Color de fondo (vacío = usar el del tema)" value={h.bg} onChange={(v) => set("header.bg", v)} tid="header-bg" />
          <Toggle label="Header fijo al hacer scroll (sticky)" checked={h.sticky} onChange={(v) => set("header.sticky", v)} tid="header-sticky" />
          <Toggle label="Transparente sobre el Hero del Home" checked={h.transparent} onChange={(v) => set("header.transparent", v)} tid="header-transparent" />
          <p className="text-xs text-zinc-500">El logo se sube desde “Tema y estilos → Identidad”.</p>
        </Panel>
      </div>
      <Panel title="Menú principal (arrastrá para ordenar, hasta 3 niveles)"><MenuEditor items={s.menu || []} onChange={(v) => set("menu", v)} /></Panel>
      <Panel title="Buscador estilo Mercado Libre">
        <div className="grid sm:grid-cols-3 gap-4">
          <Text label="Placeholder" value={sr.placeholder} onChange={(v) => set("search.placeholder", v)} tid="search-placeholder" />
          <ColorField label="Fondo" value={sr.bg} onChange={(v) => set("search.bg", v)} tid="search-bg" />
          <ColorField label="Borde" value={sr.border} onChange={(v) => set("search.border", v)} tid="search-border" />
          <ColorField label="Texto" value={sr.text} onChange={(v) => set("search.text", v)} tid="search-text" />
          <ColorField label="Ícono" value={sr.icon} onChange={(v) => set("search.icon", v)} tid="search-icon" />
          <ColorField label="Fondo desplegable" value={sr.dropdown_bg} onChange={(v) => set("search.dropdown_bg", v)} tid="search-dropdown-bg" />
          <Text label={`Redondeo (${sr.radius}px)`} type="range" min={0} max={999} value={sr.radius} onChange={(v) => set("search.radius", Number(v))} tid="search-radius" />
        </div>
        <div className="flex items-center gap-2 px-4 h-11 max-w-xl" style={{ background: sr.bg, border: `1px solid ${sr.border}`, borderRadius: sr.radius, color: sr.text }}>
          <Search className="w-4 h-4" style={{ color: sr.icon }} /><span className="text-sm opacity-60">{sr.placeholder}</span>
        </div>
      </Panel>
    </div>
  );
}
