import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Truck, Store, Check } from "lucide-react";
import { toast } from "sonner";
import { api, img, fmt, errMsg, PAY_LABEL } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useSite } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useQuote, CouponBox, Totals } from "@/store/CartDrawer";

const Choice = ({ active, onClick, children, tid }) => (
  <button type="button" data-testid={tid} onClick={onClick} className={`w-full text-left p-4 border-2 transition-colors flex gap-3 items-start ${active ? "border-[var(--primary)]" : "border-line"}`} style={{ borderRadius: "var(--radius)" }}>
    <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 grid place-items-center ${active ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--btn-text)]" : "border-line"}`}>{active && <Check className="w-3 h-3" />}</span>
    <div className="flex-1">{children}</div>
  </button>
);

export default function Checkout() {
  const { items, currency, coupon, clear } = useCart();
  const { settings } = useSite();
  const { user } = useAuth();
  const nav = useNavigate();
  const ship = settings.shipping || {};
  const pays = settings.payments || {};
  const [shipping, setShipping] = useState(ship.home_enabled ? "home" : "pickup");
  const [payment, setPayment] = useState(Object.keys(pays).find((k) => pays[k].enabled) || "");
  const [c, setC] = useState({ name: "", email: "", phone: "", address: "", city: "", zip: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const quote = useQuote({ shipping_method: shipping, payment_method: payment });

  useEffect(() => { if (user) setC((x) => ({ ...x, name: x.name || user.name, email: x.email || user.email, phone: x.phone || user.phone || "" })); }, [user]);

  if (!items.length) return <div className="py-32 text-center" data-testid="checkout-empty">Tu carrito está vacío. <Link to="/catalogo" className="underline">Ver productos</Link></div>;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/orders", { items: items.map(({ product_id, variant_id, qty }) => ({ product_id, variant_id, qty })), currency, coupon: coupon || null,
        shipping_method: shipping, payment_method: payment, customer: c, return_url: window.location.origin });
      clear();
      if (data.redirect?.startsWith("http")) window.location.href = data.redirect;
      else nav(data.redirect || `/orden/${data.order.id}`);
    } catch (er) { toast.error(errMsg(er)); setBusy(false); }
  };
  const f = (k, label, req, type = "text") => (
    <label className="block text-sm"><span className="font-medium">{label}{req && " *"}</span>
      <input data-testid={`checkout-${k}`} type={type} required={req} value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} className="input-theme w-full px-3 py-2.5 mt-1" /></label>
  );
  const pct = (k) => (k === "mercadopago" ? pays[k].adjust_pct : -(pays[k].discount_pct || 0));

  return (
    <form onSubmit={submit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1fr_400px] gap-10" data-testid="checkout-page">
      <div className="space-y-10">
        <section className="space-y-4"><h2 className="text-xl font-bold">1. Tus datos</h2>
          <div className="grid sm:grid-cols-2 gap-4">{f("name", "Nombre y apellido", true)}{f("email", "Email", true, "email")}{f("phone", "Teléfono / WhatsApp", true)}</div>
        </section>
        <section className="space-y-3"><h2 className="text-xl font-bold">2. Entrega</h2>
          {ship.home_enabled && <Choice tid="ship-home" active={shipping === "home"} onClick={() => setShipping("home")}>
            <div className="flex items-center gap-2 font-semibold"><Truck className="w-4 h-4" />Envío a domicilio</div>
            <p className="text-sm text-ink-muted">{fmt(ship.home_cost, "ARS")} · Gratis superando {fmt(ship.free_over, "ARS")}</p></Choice>}
          {ship.pickup_enabled && <Choice tid="ship-pickup" active={shipping === "pickup"} onClick={() => setShipping("pickup")}>
            <div className="flex items-center gap-2 font-semibold"><Store className="w-4 h-4" />Retiro en sucursal · Gratis</div>
            <p className="text-sm text-ink-muted">{ship.pickup_address}</p></Choice>}
          {shipping === "home" && <div className="grid sm:grid-cols-3 gap-4 pt-2">{f("address", "Dirección", true)}{f("city", "Localidad", true)}{f("zip", "Código postal", false)}</div>}
        </section>
        <section className="space-y-3"><h2 className="text-xl font-bold">3. Pago</h2>
          {Object.entries(pays).filter(([, v]) => v.enabled).map(([k, v]) => (
            <Choice key={k} tid={`pay-${k}`} active={payment === k} onClick={() => setPayment(k)}>
              <div className="flex justify-between font-semibold"><span>{v.title || PAY_LABEL[k]}</span>
                {pct(k) !== 0 && <span className={`text-xs font-bold px-2 py-0.5 ${pct(k) < 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`} style={{ borderRadius: "var(--radius)" }}>{pct(k) < 0 ? `${-pct(k)}% OFF` : `+${pct(k)}% recargo`}</span>}</div>
              <p className="text-sm text-ink-muted">{k === "mercadopago" ? v.description : k === "cod" ? `${v.instructions} Zonas: ${v.zones}` : `${v.bank} · Alias: ${v.alias}`}</p>
              {k === "mercadopago" && v.mode === "sandbox" && <p className="text-[11px] text-amber-600 font-semibold mt-1">MODO SIMULACIÓN</p>}
            </Choice>
          ))}
        </section>
        <label className="block text-sm"><span className="font-medium">Notas del pedido</span>
          <textarea data-testid="checkout-notes" value={c.notes} onChange={(e) => setC({ ...c, notes: e.target.value })} className="input-theme w-full px-3 py-2 mt-1" rows={2} /></label>
      </div>
      <aside className="card-theme p-6 h-fit lg:sticky lg:top-28 space-y-5" data-testid="checkout-summary">
        <h3 className="font-bold text-lg">Resumen</h3>
        {(quote?.items || []).map((i) => (
          <div key={i.variant_id} className="flex gap-3 text-sm"><img src={img(i.image)} alt="" className="w-14 h-14 object-cover rounded" />
            <div className="flex-1"><p className="font-medium leading-tight">{i.name}</p><p className="text-xs text-ink-muted">{i.variant_name} × {i.qty}</p></div>
            <span className="font-semibold">{fmt(i.unit_price * i.qty, currency)}</span></div>
        ))}
        <CouponBox />
        <Totals quote={quote} />
        <button data-testid="place-order-btn" disabled={busy || !payment || quote?.errors?.length > 0} className="btn-theme w-full py-4 font-bold uppercase tracking-wider text-sm">{busy ? "Procesando…" : "Confirmar pedido"}</button>
      </aside>
    </form>
  );
}
