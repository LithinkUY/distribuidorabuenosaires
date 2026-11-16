import { useEffect, useState } from "react";
import { Search, X, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { api, img, fmt, errMsg, STATUSES, PAY_LABEL } from "@/lib/api";
import { useSite } from "@/context/ThemeContext";
import { orderText } from "@/store/pages/OrderPage";
import { waLink } from "@/store/Footer";
import { PageHeader, Panel, Btn } from "@/admin/ui";

const COLORS = { Pendiente: "bg-amber-100 text-amber-700", Pagado: "bg-emerald-100 text-emerald-700", "En Preparación": "bg-sky-100 text-sky-700",
  Enviado: "bg-indigo-100 text-indigo-700", Entregado: "bg-zinc-900 text-white", Cancelado: "bg-red-100 text-red-700" };
export const StatusBadge = ({ s }) => <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${COLORS[s] || ""}`}>{s}</span>;

function Detail({ o, onClose, onStatus }) {
  const { settings } = useSite();
  const c = o.customer;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" data-testid="order-detail">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative w-full max-w-xl bg-white h-full overflow-y-auto p-6 space-y-5">
        <div className="flex justify-between items-start"><div><h2 className="text-xl font-bold">Pedido #{o.number}</h2><p className="text-xs text-zinc-500">{new Date(o.created_at).toLocaleString("es-AR")}</p></div><button onClick={onClose} data-testid="order-detail-close"><X /></button></div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-zinc-500 uppercase font-semibold">Cliente</p><p className="font-semibold">{c.name}</p><p>{c.email}</p><p>{c.phone}</p></div>
          <div><p className="text-xs text-zinc-500 uppercase font-semibold">Entrega</p><p>{o.shipping_method === "home" ? `${c.address}, ${c.city} ${c.zip || ""}` : "Retiro en sucursal"}</p>
            <p className="text-xs text-zinc-500 uppercase font-semibold mt-2">Pago</p><p>{PAY_LABEL[o.payment_method]} {o.payment_status && `· ${o.payment_status}`}</p></div>
        </div>
        {c.notes && <p className="text-sm bg-zinc-50 rounded p-3">Notas: {c.notes}</p>}
        <div className="space-y-3">{o.items.map((i) => (
          <div key={i.variant_id} className="flex gap-3 text-sm"><img src={img(i.image)} alt="" className="w-12 h-12 rounded object-cover" /><div className="flex-1"><p className="font-semibold">{i.name}</p><p className="text-xs text-zinc-500">{i.variant_name} · {i.sku} × {i.qty}</p></div><b>{fmt(i.unit_price * i.qty, o.currency)}</b></div>))}</div>
        <div className="text-sm space-y-1 border-t pt-3">
          <div className="flex justify-between"><span>Subtotal</span><span>{fmt(o.subtotal, o.currency)}</span></div>
          {o.discount > 0 && <div className="flex justify-between"><span>Cupón {o.coupon_code}</span><span>-{fmt(o.discount, o.currency)}</span></div>}
          {o.payment_adjust !== 0 && <div className="flex justify-between"><span>Ajuste medio de pago</span><span>{fmt(o.payment_adjust, o.currency)}</span></div>}
          <div className="flex justify-between"><span>Envío</span><span>{fmt(o.shipping_cost, o.currency)}</span></div>
          <div className="flex justify-between font-bold text-lg"><span>Total</span><span data-testid="order-detail-total">{fmt(o.total, o.currency)}</span></div>
        </div>
        <div><p className="text-xs text-zinc-500 uppercase font-semibold mb-2">Cambiar estado</p>
          <div className="flex flex-wrap gap-2">{STATUSES.map((s) => <button key={s} data-testid={`set-status-${s}`} onClick={() => onStatus(o, s)} className={`text-xs font-semibold px-3 py-1.5 rounded border ${o.status === s ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300 hover:bg-zinc-100"}`}>{s}</button>)}</div>
          <p className="text-xs text-zinc-500 mt-2">Cancelar repone el stock automáticamente; reactivar un pedido cancelado lo vuelve a descontar.</p></div>
        <a href={waLink(c.phone?.startsWith("54") ? c.phone : `549${c.phone}`, orderText(o, settings))} target="_blank" rel="noreferrer"><Btn variant="outline" className="w-full"><MessageCircle className="w-4 h-4" />Contactar al cliente por WhatsApp</Btn></a>
      </aside>
    </div>
  );
}

export default function Orders() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sel, setSel] = useState(null);
  const load = () => api.get("/admin/orders", { params: { q: q || undefined, status: status || undefined } }).then((r) => setItems(r.data));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q, status]);
  const changeStatus = async (o, s) => {
    try { const { data } = await api.put(`/admin/orders/${o.id}/status`, { status: s }); setSel(data); toast.success(`Pedido #${o.number}: ${s}`); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <div className="space-y-6" data-testid="orders-admin">
      <PageHeader title="Pedidos" desc={`${items.length} pedidos`} />
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border rounded-md px-3 flex-1 min-w-[220px]"><Search className="w-4 h-4 text-zinc-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por N°, nombre, email o teléfono" className="py-2 text-sm outline-none flex-1" data-testid="orders-search" /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white border rounded-md px-3 text-sm" data-testid="orders-status-filter"><option value="">Todos los estados</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <Panel>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="text-left text-zinc-500 border-b"><th className="py-2">N°</th><th>Fecha</th><th>Cliente</th><th>Pago</th><th>Entrega</th><th>Estado</th><th className="text-right">Total</th></tr></thead>
          <tbody>{items.map((o) => (
            <tr key={o.id} onClick={() => setSel(o)} className="border-b border-zinc-100 cursor-pointer hover:bg-zinc-50" data-testid={`order-row-${o.number}`}>
              <td className="py-2.5 font-bold">#{o.number}</td><td>{new Date(o.created_at).toLocaleDateString("es-AR")}</td><td>{o.customer.name}</td><td>{PAY_LABEL[o.payment_method]}</td>
              <td>{o.shipping_method === "home" ? "Domicilio" : "Retiro"}</td><td><StatusBadge s={o.status} /></td><td className="text-right font-semibold">{fmt(o.total, o.currency)}</td>
            </tr>))}</tbody></table></div>
      </Panel>
      {sel && <Detail o={sel} onClose={() => setSel(null)} onStatus={changeStatus} />}
    </div>
  );
}
