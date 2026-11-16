import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { api, errMsg } from "@/lib/api";
import { PageHeader, Panel, Text, Toggle, Select, SaveBtn, Btn, Loading, useSettings } from "@/admin/ui";

function BulkUpdater() {
  const [tax, setTax] = useState({ cats: [], brands: [] });
  const [b, setB] = useState({ scope: "all", target_id: "", mode: "pct", value: 10, currency: "USD", dir: "up" });
  const [busy, setBusy] = useState(false);
  useEffect(() => { Promise.all([api.get("/categories"), api.get("/brands")]).then(([c, br]) => setTax({ cats: c.data, brands: br.data })); }, []);
  const run = async () => {
    if (b.scope !== "all" && !b.target_id) return toast.error("Elegí la categoría o marca");
    const value = Math.abs(Number(b.value)) * (b.dir === "up" ? 1 : -1);
    const label = `${b.dir === "up" ? "Aumentar" : "Disminuir"} ${Math.abs(b.value)}${b.mode === "pct" ? "%" : ` ${b.currency}`}`;
    if (!window.confirm(`${label} en ${b.scope === "all" ? "todo el catálogo" : "la selección"}?`)) return;
    setBusy(true);
    try { const { data } = await api.post("/admin/prices/bulk", { ...b, value }); toast.success(`${data.variants_updated} variantes actualizadas`); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const targets = b.scope === "category" ? tax.cats : tax.brands;
  return (
    <Panel title="Actualizador masivo de precios">
      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
        <Select label="Aplicar a" value={b.scope} onChange={(v) => setB({ ...b, scope: v, target_id: "" })} tid="bulk-scope" options={[{ value: "all", label: "Todo el catálogo" }, { value: "category", label: "Una categoría" }, { value: "brand", label: "Una marca" }]} />
        {b.scope !== "all" && <Select label="Selección" value={b.target_id} onChange={(v) => setB({ ...b, target_id: v })} tid="bulk-target" options={[{ value: "", label: "Elegir…" }, ...targets.map((t) => ({ value: t.id, label: t.name }))]} />}
        <Select label="Acción" value={b.dir} onChange={(v) => setB({ ...b, dir: v })} tid="bulk-dir" options={[{ value: "up", label: "Aumentar" }, { value: "down", label: "Disminuir" }]} />
        <Select label="Tipo" value={b.mode} onChange={(v) => setB({ ...b, mode: v })} tid="bulk-mode" options={[{ value: "pct", label: "Porcentaje (%)" }, { value: "fixed", label: "Monto fijo" }]} />
        {b.mode === "fixed" && <Select label="Moneda" value={b.currency} onChange={(v) => setB({ ...b, currency: v })} options={[{ value: "USD", label: "USD" }, { value: "ARS", label: "ARS" }]} tid="bulk-currency" />}
        <Text label="Valor" type="number" value={b.value} onChange={(v) => setB({ ...b, value: v })} tid="bulk-value" />
      </div>
      <Btn onClick={run} disabled={busy} data-testid="bulk-apply-btn"><TrendingUp className="w-4 h-4" />Aplicar actualización</Btn>
      <p className="text-xs text-zinc-500">Afecta precio y precio de oferta de cada variante. Los precios ARS automáticos se recalculan con la cotización.</p>
    </Panel>
  );
}

export default function Pricing() {
  const { s, set, save, saving } = useSettings();
  if (!s) return <Loading />;
  const sh = s.shipping, c = s.card;
  return (
    <div className="space-y-6" data-testid="pricing-admin">
      <PageHeader title="Precios, cotización y envíos"><SaveBtn onClick={() => save(["usd_rate", "shipping", "card"])} saving={saving} tid="pricing-save-btn" /></PageHeader>
      <div className="grid lg:grid-cols-3 gap-6">
        <Panel title="Cotización Dólar">
          <Text label="1 USD = X ARS" type="number" value={s.usd_rate} onChange={(v) => set("usd_rate", v)} tid="usd-rate-input" />
          <p className="text-xs text-zinc-500">Al guardar, todos los precios ARS automáticos se actualizan al instante.</p>
        </Panel>
        <Panel title="Envíos (montos en ARS)">
          <Toggle label="Envío a domicilio" checked={sh.home_enabled} onChange={(v) => set("shipping.home_enabled", v)} tid="ship-home-enabled" />
          <div className="grid grid-cols-2 gap-3"><Text label="Costo de envío" type="number" value={sh.home_cost} onChange={(v) => set("shipping.home_cost", v)} tid="ship-cost" />
            <Text label="Gratis superando" type="number" value={sh.free_over} onChange={(v) => set("shipping.free_over", v)} tid="ship-free-over" /></div>
          <Toggle label="Retiro en sucursal" checked={sh.pickup_enabled} onChange={(v) => set("shipping.pickup_enabled", v)} tid="ship-pickup-enabled" />
          <Text label="Dirección / horario de retiro" value={sh.pickup_address} onChange={(v) => set("shipping.pickup_address", v)} tid="ship-pickup-address" />
        </Panel>
        <Panel title="Tarjetas de producto">
          <Toggle label="Mostrar marca" checked={c.show_brand} onChange={(v) => set("card.show_brand", v)} tid="card-show-brand" />
          <Toggle label="Mostrar contador de stock" checked={c.show_stock} onChange={(v) => set("card.show_stock", v)} tid="card-show-stock" />
          <Toggle label="Mostrar ambas monedas" checked={c.show_dual} onChange={(v) => set("card.show_dual", v)} tid="card-show-dual" />
          <Toggle label="Etiqueta de descuento" checked={c.show_discount} onChange={(v) => set("card.show_discount", v)} tid="card-show-discount" />
          <Toggle label="Botón de compra rápida" checked={c.show_quick_buy} onChange={(v) => set("card.show_quick_buy", v)} tid="card-show-quick" />
        </Panel>
      </div>
      <BulkUpdater />
    </div>
  );
}
