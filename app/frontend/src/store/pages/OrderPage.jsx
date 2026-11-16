import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Clock, XCircle, MessageCircle } from "lucide-react";
import { api, img, fmt, PAY_LABEL } from "@/lib/api";
import { useSite } from "@/context/ThemeContext";
import { waLink } from "@/store/Footer";

export const orderText = (o, settings) => {
  const t = settings.payments?.transfer || {};
  const lines = [`*Nuevo pedido #${o.number}*`, `Cliente: ${o.customer.name} (${o.customer.phone})`, ""];
  o.items.forEach((i) => lines.push(`• ${i.qty}x ${i.name} [${i.variant_name}] - ${fmt(i.unit_price * i.qty, o.currency)}`));
  lines.push("", `Subtotal: ${fmt(o.subtotal, o.currency)}`);
  if (o.discount) lines.push(`Cupón ${o.coupon_code}: -${fmt(o.discount, o.currency)}`);
  if (o.payment_adjust) lines.push(`Ajuste medio de pago: ${fmt(o.payment_adjust, o.currency)}`);
  lines.push(`Envío: ${o.shipping_method === "home" ? `${fmt(o.shipping_cost, o.currency)} - ${o.customer.address}, ${o.customer.city}` : "Retiro en sucursal"}`);
  lines.push(`*TOTAL: ${fmt(o.total, o.currency)}*`, `Pago: ${PAY_LABEL[o.payment_method]}`);
  if (o.payment_method === "transfer") lines.push(`Alias: ${t.alias} · CBU: ${t.cbu}`);
  return lines.join("\n");
};

export default function OrderPage() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const { settings } = useSite();
  const [o, setO] = useState(null);

  useEffect(() => {
    const pid = sp.get("payment_id") || sp.get("collection_id");
    const req = pid && pid !== "null" ? api.post(`/payments/mp/verify/${id}`, null, { params: { payment_id: pid } }).catch(() => api.get(`/orders/${id}`)) : api.get(`/orders/${id}`);
    req.then((r) => setO(r.data)).catch(() => setO(false));
  }, [id, sp]);

  if (o === false) return <div className="py-32 text-center">Pedido no encontrado.</div>;
  if (!o) return <div className="py-32 text-center text-ink-muted">Cargando…</div>;
  const t = settings.payments?.transfer || {};
  const rejected = o.payment_status === "rejected";
  const paid = o.payment_status === "approved" || o.status === "Pagado";
  const Icon = rejected ? XCircle : paid ? CheckCircle2 : Clock;

  return (
    <div className="max-w-3xl mx-auto px-4 py-14 space-y-8" data-testid="order-page">
      <div className="text-center space-y-3">
        <Icon className={`w-14 h-14 mx-auto ${rejected ? "text-red-500" : paid ? "text-emerald-600" : "text-amber-500"}`} />
        <h1 className="text-3xl sm:text-4xl font-bold">{rejected ? "El pago fue rechazado" : "¡Gracias por tu compra!"}</h1>
        <p className="text-ink-muted">Pedido <b data-testid="order-number">#{o.number}</b> · Estado: <b data-testid="order-status">{o.status}</b></p>
        {rejected && <Link to={`/pago-mp/${o.id}`} className="underline text-sm" data-testid="order-retry-pay">Reintentar pago</Link>}
      </div>
      {o.payment_method === "transfer" && <div className="card-theme p-5 text-sm space-y-1" data-testid="order-transfer-info">
        <p className="font-bold mb-1">Datos para transferir</p><p>Banco: {t.bank}</p><p>Titular: {t.holder}</p><p>CBU: {t.cbu}</p><p>Alias: <b>{t.alias}</b></p></div>}
      {o.payment_method === "cod" && <div className="card-theme p-5 text-sm">{settings.payments?.cod?.instructions}</div>}
      <div className="card-theme p-6 space-y-4">
        {o.items.map((i) => (
          <div key={i.variant_id} className="flex gap-3 text-sm"><img src={img(i.image)} alt="" className="w-14 h-14 object-cover rounded" />
            <div className="flex-1"><p className="font-medium">{i.name}</p><p className="text-xs text-ink-muted">{i.variant_name} · SKU {i.sku} × {i.qty}</p></div>
            <span className="font-semibold">{fmt(i.unit_price * i.qty, o.currency)}</span></div>
        ))}
        <div className="border-t border-line pt-4 text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>{fmt(o.subtotal, o.currency)}</span></div>
          {o.discount > 0 && <div className="flex justify-between"><span>Cupón {o.coupon_code}</span><span>-{fmt(o.discount, o.currency)}</span></div>}
          {o.payment_adjust !== 0 && <div className="flex justify-between"><span>Ajuste {PAY_LABEL[o.payment_method]}</span><span>{fmt(o.payment_adjust, o.currency)}</span></div>}
          <div className="flex justify-between"><span>Envío ({o.shipping_method === "home" ? "domicilio" : "retiro"})</span><span>{fmt(o.shipping_cost, o.currency)}</span></div>
          <div className="flex justify-between text-lg font-bold pt-2" data-testid="order-total"><span>Total</span><span>{fmt(o.total, o.currency)}</span></div>
        </div>
      </div>
      <a data-testid="order-whatsapp-btn" href={waLink(settings.whatsapp?.number, orderText(o, settings))} target="_blank" rel="noreferrer"
        className="w-full py-4 flex items-center justify-center gap-2 font-bold text-white bg-[#25D366] hover:opacity-90" style={{ borderRadius: "var(--radius)" }}>
        <MessageCircle className="w-5 h-5" /> Enviar pedido por WhatsApp
      </a>
    </div>
  );
}
