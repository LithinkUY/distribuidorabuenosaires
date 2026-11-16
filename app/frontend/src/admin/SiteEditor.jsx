import { Plus, Trash2 } from "lucide-react";
import { uid } from "@/lib/api";
import { PageHeader, Panel, Text, Area, Toggle, ColorField, Select, ImageField, SortableList, SaveBtn, Btn, Loading, useSettings } from "@/admin/ui";

export default function SiteEditor() {
  const { s, set, save, saving } = useSettings();
  if (!s) return <Loading />;
  const f = s.footer, w = s.whatsapp, p = s.popup;
  const cols = f.columns || [];
  const upCol = (id, patch) => set("footer.columns", cols.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  return (
    <div className="space-y-6" data-testid="site-editor">
      <PageHeader title="Footer, WhatsApp y Pop-up"><SaveBtn onClick={() => save(["footer", "whatsapp", "popup"])} saving={saving} tid="site-save-btn" /></PageHeader>
      <Panel title="Footer">
        <div className="grid sm:grid-cols-2 gap-4">
          <ColorField label="Fondo (vacío = tema)" value={f.bg} onChange={(v) => set("footer.bg", v)} tid="footer-bg" />
          <ColorField label="Texto (vacío = tema)" value={f.text} onChange={(v) => set("footer.text", v)} tid="footer-text" />
          <Area label="Texto 'sobre nosotros'" value={f.about} onChange={(v) => set("footer.about", v)} rows={2} tid="footer-about" />
          <Area label="Contacto" value={f.contact} onChange={(v) => set("footer.contact", v)} rows={2} tid="footer-contact" />
          <Area label="Textos legales" value={f.legal} onChange={(v) => set("footer.legal", v)} rows={2} tid="footer-legal-input" />
        </div>
        <div className="grid sm:grid-cols-4 gap-3">{["instagram", "facebook", "tiktok", "youtube"].map((k) => <Text key={k} label={k} value={f.socials?.[k]} onChange={(v) => set(`footer.socials.${k}`, v)} tid={`social-input-${k}`} />)}</div>
        <h3 className="font-semibold text-sm pt-2">Columnas de enlaces</h3>
        <SortableList items={cols} onChange={(v) => set("footer.columns", v)} tid="footer-columns" render={(c) => (
          <div className="space-y-2">
            <div className="flex gap-2"><input value={c.title} onChange={(e) => upCol(c.id, { title: e.target.value })} className="border border-zinc-300 rounded px-2 py-1.5 text-sm font-semibold flex-1" data-testid="footer-col-title" />
              <Btn variant="danger" onClick={() => set("footer.columns", cols.filter((x) => x.id !== c.id))}><Trash2 className="w-4 h-4" /></Btn></div>
            {(c.links || []).map((l) => (
              <div key={l.id} className="flex gap-2 pl-4">
                <input value={l.label} onChange={(e) => upCol(c.id, { links: c.links.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)) })} className="border border-zinc-200 rounded px-2 py-1 text-sm flex-1" />
                <input value={l.url} onChange={(e) => upCol(c.id, { links: c.links.map((x) => (x.id === l.id ? { ...x, url: e.target.value } : x)) })} className="border border-zinc-200 rounded px-2 py-1 text-sm flex-1 font-mono" />
                <Btn variant="danger" onClick={() => upCol(c.id, { links: c.links.filter((x) => x.id !== l.id) })}><Trash2 className="w-3.5 h-3.5" /></Btn>
              </div>
            ))}
            <Btn variant="outline" className="ml-4 !py-1" onClick={() => upCol(c.id, { links: [...(c.links || []), { id: uid(), label: "Enlace", url: "/" }] })}><Plus className="w-3.5 h-3.5" />Enlace</Btn>
          </div>
        )} />
        <Btn variant="outline" onClick={() => set("footer.columns", [...cols, { id: uid(), title: "Nueva columna", links: [] }])} data-testid="footer-add-col"><Plus className="w-4 h-4" />Agregar columna</Btn>
        <h3 className="font-semibold text-sm pt-2">Mapa de Google Maps</h3>
        <Toggle label="Mostrar mapa" checked={f.map_enabled} onChange={(v) => set("footer.map_enabled", v)} tid="map-enabled" />
        <Text label="URL del iframe (Google Maps → Compartir → Insertar mapa → src)" value={f.map_iframe} onChange={(v) => set("footer.map_iframe", v.includes("<iframe") ? (v.match(/src="([^"]+)"/) || [])[1] || v : v)} tid="map-iframe" />
        {f.map_enabled && f.map_iframe && <iframe title="map" src={f.map_iframe} className="w-full h-48 rounded-lg border" />}
      </Panel>
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Botón flotante de WhatsApp">
          <Toggle label="Activado" checked={w.enabled} onChange={(v) => set("whatsapp.enabled", v)} tid="wa-enabled" />
          <Text label="Número (con código de país)" value={w.number} onChange={(v) => set("whatsapp.number", v)} tid="wa-number" />
          <Select label="Posición" value={w.position} onChange={(v) => set("whatsapp.position", v)} options={[{ value: "right", label: "Derecha" }, { value: "left", label: "Izquierda" }]} tid="wa-position" />
          <Text label="Mensaje inicial" value={w.message} onChange={(v) => set("whatsapp.message", v)} tid="wa-message" />
          <Text label="Texto de la burbuja" value={w.bubble} onChange={(v) => set("whatsapp.bubble", v)} tid="wa-bubble" />
        </Panel>
        <Panel title="Pop-up promocional">
          <Toggle label="Mostrar al entrar a la web" checked={p.enabled} onChange={(v) => set("popup.enabled", v)} tid="popup-enabled" />
          <ImageField label="Imagen" value={p.image} onChange={(v) => set("popup.image", v)} tid="popup-image" />
          <Text label="Título" value={p.title} onChange={(v) => set("popup.title", v)} tid="popup-title" />
          <Area label="Texto" value={p.text} onChange={(v) => set("popup.text", v)} rows={2} tid="popup-text" />
          <div className="grid grid-cols-3 gap-3"><Text label="Botón" value={p.btn_text} onChange={(v) => set("popup.btn_text", v)} /><Text label="Enlace" value={p.btn_link} onChange={(v) => set("popup.btn_link", v)} />
            <Text label="Demora (seg)" type="number" value={p.delay} onChange={(v) => set("popup.delay", v)} /></div>
          <p className="text-xs text-zinc-500">Se muestra una vez por sesión del visitante.</p>
        </Panel>
      </div>
    </div>
  );
}
