import { PageHeader, Panel, Text, Area, Toggle, Select, SaveBtn, Loading, useSettings } from "@/admin/ui";

export default function Payments() {
  const { s, set, save, saving } = useSettings();
  if (!s) return <Loading />;
  const mp = s.payments.mercadopago, cod = s.payments.cod, tr = s.payments.transfer;
  return (
    <div className="space-y-6" data-testid="payments-admin">
      <PageHeader title="Pasarelas de pago" desc="Sólo los métodos activos se muestran en el checkout."><SaveBtn onClick={() => save(["payments"])} saving={saving} tid="payments-save-btn" /></PageHeader>
      <div className="grid lg:grid-cols-3 gap-6">
        <Panel title="Mercado Pago">
          <Toggle label="Activo" checked={mp.enabled} onChange={(v) => set("payments.mercadopago.enabled", v)} tid="mp-enabled" />
          <Select label="Modo" value={mp.mode} onChange={(v) => set("payments.mercadopago.mode", v)} tid="mp-mode" options={[{ value: "sandbox", label: "Sandbox (simulación interactiva)" }, { value: "production", label: "Producción (cobros reales)" }]} />
          <Text label="Título" value={mp.title} onChange={(v) => set("payments.mercadopago.title", v)} tid="mp-title" />
          <Text label="Descripción" value={mp.description} onChange={(v) => set("payments.mercadopago.description", v)} />
          <Text label="Public Key" value={mp.public_key} onChange={(v) => set("payments.mercadopago.public_key", v)} tid="mp-public-key" />
          <Text label="Access Token" type="password" value={mp.access_token} onChange={(v) => set("payments.mercadopago.access_token", v)} tid="mp-access-token" hint="Se guarda sólo en el servidor, nunca se envía a la tienda." />
          <Text label="% recargo (+) o descuento (-)" type="number" value={mp.adjust_pct} onChange={(v) => set("payments.mercadopago.adjust_pct", v)} tid="mp-adjust" />
          {mp.mode === "production" && !mp.access_token && <p className="text-xs text-red-600 font-semibold" data-testid="mp-warning">Cargá el Access Token para cobrar en producción.</p>}
          <p className="text-xs text-zinc-500">En producción el cliente es redirigido a Checkout Pro y el pedido se marca “Pagado” cuando Mercado Pago confirma el cobro.</p>
        </Panel>
        <Panel title="Pago contra entrega">
          <Toggle label="Activo" checked={cod.enabled} onChange={(v) => set("payments.cod.enabled", v)} tid="cod-enabled" />
          <Text label="Título" value={cod.title} onChange={(v) => set("payments.cod.title", v)} tid="cod-title" />
          <Area label="Instrucciones" value={cod.instructions} onChange={(v) => set("payments.cod.instructions", v)} rows={3} tid="cod-instructions" />
          <Text label="Zonas válidas" value={cod.zones} onChange={(v) => set("payments.cod.zones", v)} tid="cod-zones" />
          <Text label="% descuento en efectivo" type="number" value={cod.discount_pct} onChange={(v) => set("payments.cod.discount_pct", v)} tid="cod-discount" />
        </Panel>
        <Panel title="Transferencia bancaria">
          <Toggle label="Activo" checked={tr.enabled} onChange={(v) => set("payments.transfer.enabled", v)} tid="transfer-enabled" />
          <Text label="Título" value={tr.title} onChange={(v) => set("payments.transfer.title", v)} />
          <Text label="Banco" value={tr.bank} onChange={(v) => set("payments.transfer.bank", v)} tid="transfer-bank" />
          <Text label="Titular" value={tr.holder} onChange={(v) => set("payments.transfer.holder", v)} />
          <Text label="CBU / CVU" value={tr.cbu} onChange={(v) => set("payments.transfer.cbu", v)} tid="transfer-cbu" />
          <Text label="Alias" value={tr.alias} onChange={(v) => set("payments.transfer.alias", v)} tid="transfer-alias" />
          <Text label="% descuento" type="number" value={tr.discount_pct} onChange={(v) => set("payments.transfer.discount_pct", v)} tid="transfer-discount" />
        </Panel>
      </div>
    </div>
  );
}
