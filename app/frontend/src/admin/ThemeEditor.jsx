import { useEffect } from "react";
import { FONTS } from "@/lib/api";
import { useSite } from "@/context/ThemeContext";
import { PageHeader, Panel, ColorField, Select, Text, Area, ImageField, SaveBtn, Loading, useSettings } from "@/admin/ui";
import ProductCard from "@/store/ProductCard";
import { Slider } from "@/components/ui/slider";

const COLORS = [["primary", "Color primario"], ["secondary", "Color secundario"], ["bg_main", "Fondo general"], ["bg_card", "Fondo de tarjetas"],
  ["bg_header", "Fondo del header"], ["header_text", "Texto del header"], ["bg_footer", "Fondo del footer"], ["footer_text", "Texto del footer"],
  ["text_main", "Textos principales"], ["btn", "Color de botones"], ["btn_text", "Texto de botones"], ["sale", "Etiquetas de oferta"]];

const SAMPLE = { id: "x", slug: "demo", name: "Funda de Asiento Línea Sport", brand: "Distribuidora BA", images: [], stock_total: 8,
  variants: [{ id: "v", stock: 8, attrs: {} }], min_variant: { price_ars: 195000, sale_ars: 165750, price_usd: 156, sale_usd: 132.6, stock: 8 } };

function Preview() {
  return (
    <div className="rounded-xl overflow-hidden border border-zinc-200 font-theme" style={{ background: "var(--bg-main)", color: "var(--text-main)" }} data-testid="theme-preview">
      <div className="px-5 py-3 flex items-center justify-between text-sm font-bold" style={{ background: "var(--bg-header)", color: "var(--header-text)" }}>MI TIENDA <span className="text-xs font-medium opacity-70">Inicio · Productos · Ofertas</span></div>
      <div className="p-5 grid grid-cols-2 gap-4">
        <ProductCard p={SAMPLE} cfgOverride={{ show_brand: true, show_stock: true, show_discount: true, show_quick_buy: true, show_dual: true }} />
        <div className="space-y-3">
          <h3 className="text-xl font-bold">Título de ejemplo</h3>
          <p className="text-sm text-ink-muted">Así se verán los textos de tu tienda con la tipografía seleccionada.</p>
          <button className="btn-theme px-4 py-2 text-sm font-semibold w-full">Botón principal</button>
          <button className="btn-outline-theme px-4 py-2 text-sm w-full">Botón secundario</button>
          <span className="inline-block bg-sale text-white text-xs font-bold px-2 py-1" style={{ borderRadius: "var(--radius)" }}>30% OFF</span>
          <div className="p-3 text-xs" style={{ background: "var(--secondary)", borderRadius: "var(--radius)" }}>Bloque color secundario</div>
        </div>
      </div>
      <div className="px-5 py-4 text-xs" style={{ background: "var(--bg-footer)", color: "var(--footer-text)" }}>Footer · © Mi tienda</div>
    </div>
  );
}

export default function ThemeEditor() {
  const { s, set, save, saving } = useSettings();
  const { setPreview, reload } = useSite();
  useEffect(() => { if (s) setPreview(s.theme); }, [s, setPreview]);
  useEffect(() => () => { reload(); }, [reload]);
  if (!s) return <Loading />;
  const t = s.theme;
  return (
    <div data-testid="theme-editor">
      <PageHeader title="Tema y estilos globales" desc="Los cambios se previsualizan en tiempo real. Guardá para publicarlos.">
        <SaveBtn onClick={() => save(["theme", "identity", "custom_css"])} saving={saving} tid="theme-save-btn" />
      </PageHeader>
      <div className="grid xl:grid-cols-[1fr_460px] gap-6">
        <div className="space-y-6">
          <Panel title="Paleta de colores">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{COLORS.map(([k, l]) => <ColorField key={k} label={l} value={t[k]} onChange={(v) => set(`theme.${k}`, v)} tid={`color-${k}`} />)}</div>
          </Panel>
          <Panel title="Tipografía y bordes">
            <div className="grid sm:grid-cols-2 gap-6 items-end">
              <Select label="Fuente global" value={t.font} onChange={(v) => set("theme.font", v)} options={FONTS.map((f) => ({ value: f, label: f }))} tid="theme-font" />
              <div className="space-y-3"><p className="text-sm font-medium text-zinc-700">Redondeo de bordes: <b data-testid="theme-radius-value">{t.radius}px</b> <span className="text-xs text-zinc-400">({t.radius < 3 ? "cuadrado industrial" : t.radius > 14 ? "redondeado moderno" : "suave"})</span></p>
                <Slider data-testid="theme-radius" value={[t.radius]} min={0} max={28} step={1} onValueChange={([v]) => set("theme.radius", v)} /></div>
            </div>
          </Panel>
          <Panel title="Identidad y SEO">
            <div className="grid sm:grid-cols-3 gap-4">
              <ImageField label="Logo principal" value={s.identity.logo} onChange={(v) => set("identity.logo", v)} tid="logo" />
              <ImageField label="Logo versión blanca/oscura (footer)" value={s.identity.logo_dark} onChange={(v) => set("identity.logo_dark", v)} tid="logo-dark" />
              <ImageField label="Favicon" value={s.identity.favicon} onChange={(v) => set("identity.favicon", v)} tid="favicon" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Text label="Nombre de marca (si no hay logo)" value={s.identity.brand_name} onChange={(v) => set("identity.brand_name", v)} tid="brand-name" />
              <Text label="Título del sitio" value={s.identity.site_title} onChange={(v) => set("identity.site_title", v)} tid="site-title" />
            </div>
            <Area label="Meta descripción" value={s.identity.meta_description} onChange={(v) => set("identity.meta_description", v)} tid="meta-description" rows={2} />
          </Panel>
          <Panel title="CSS personalizado (avanzado)">
            <Area value={s.custom_css} onChange={(v) => set("custom_css", v)} tid="custom-css" rows={6} mono label="Se inyecta al final de la página" />
          </Panel>
        </div>
        <div className="xl:sticky xl:top-6 h-fit space-y-2"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Vista previa en vivo</p><Preview /></div>
      </div>
    </div>
  );
}
