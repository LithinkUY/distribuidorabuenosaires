import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { api, img, fmt } from "@/lib/api";

export const useQuote = (extra = {}) => {
  const { items, currency, coupon } = useCart();
  const [quote, setQuote] = useState(null);
  const key = JSON.stringify([items.map((i) => [i.variant_id, i.qty]), currency, coupon, extra]);
  useEffect(() => {
    if (!items.length) { setQuote(null); return; }
    api.post("/cart/quote", { items: items.map(({ product_id, variant_id, qty }) => ({ product_id, variant_id, qty })), currency, coupon: coupon || null, ...extra })
      .then((r) => setQuote(r.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return quote;
};

export function CouponBox() {
  const { coupon, setCoupon } = useCart();
  const [code, setCode] = useState(coupon);
  return (
    <div className="flex gap-2">
      <div className="flex-1 flex items-center gap-2 input-theme px-3">
        <Tag className="w-4 h-4 opacity-50" />
        <input data-testid="coupon-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Código de cupón" className="bg-transparent outline-none py-2 text-sm flex-1 min-w-0" />
      </div>
      {coupon ? <button data-testid="coupon-remove-btn" onClick={() => { setCoupon(""); setCode(""); }} className="btn-outline-theme px-3 text-sm">Quitar</button>
        : <button data-testid="coupon-apply-btn" onClick={() => setCoupon(code.trim())} className="btn-theme px-4 text-sm font-semibold">Aplicar</button>}
    </div>
  );
}

export function Totals({ quote }) {
  if (!quote) return null;
  const c = quote.currency;
  const row = (l, v, tid, cls = "") => <div className={`flex justify-between ${cls}`} data-testid={tid}><span>{l}</span><span>{v}</span></div>;
  return (
    <div className="space-y-1.5 text-sm">
      {quote.coupon_msg && <p data-testid="coupon-msg" className={`text-xs font-medium ${quote.coupon_ok ? "text-emerald-600" : "text-red-500"}`}>{quote.coupon_msg}</p>}
      {row("Subtotal", fmt(quote.subtotal, c), "totals-subtotal")}
      {quote.discount > 0 && row("Descuento cupón", `- ${fmt(quote.discount, c)}`, "totals-discount", "text-emerald-600")}
      {quote.payment_adjust !== 0 && row(`${quote.payment_adjust < 0 ? "Descuento" : "Recargo"} por medio de pago (${Math.abs(quote.payment_adjust_pct)}%)`, `${quote.payment_adjust < 0 ? "-" : "+"} ${fmt(Math.abs(quote.payment_adjust), c)}`, "totals-adjust", quote.payment_adjust < 0 ? "text-emerald-600" : "")}
      {row("Envío", quote.shipping_cost ? fmt(quote.shipping_cost, c) : "Gratis / a calcular", "totals-shipping")}
      <div className="flex justify-between text-lg font-bold pt-2 border-t border-line" data-testid="totals-total"><span>Total</span><span>{fmt(quote.total, c)}</span></div>
      {quote.errors?.map((e) => <p key={e} className="text-xs text-red-500" data-testid="quote-error">{e}</p>)}
    </div>
  );
}

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, currency } = useCart();
  const quote = useQuote();
  const nav = useNavigate();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" data-testid="cart-drawer">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <aside className="relative w-full max-w-md h-full bg-surface text-ink flex flex-col shadow-2xl fade-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <h3 className="text-lg font-bold">Tu carrito</h3>
          <button onClick={() => setOpen(false)} data-testid="cart-close-btn"><X /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {!items.length && <p className="text-sm text-ink-muted py-10 text-center" data-testid="cart-empty">Tu carrito está vacío.</p>}
          {items.map((i) => (
            <div key={i.variant_id} className="flex gap-3" data-testid={`cart-item-${i.variant_id}`}>
              <img src={img(i.image)} alt="" className="w-20 h-20 object-cover" style={{ borderRadius: "var(--radius)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{i.name}</p>
                <p className="text-xs text-ink-muted">{i.variant_name}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-line" style={{ borderRadius: "var(--radius)" }}>
                    <button className="p-1.5" onClick={() => setQty(i.variant_id, i.qty - 1)} data-testid="cart-qty-minus"><Minus className="w-3 h-3" /></button>
                    <span className="w-7 text-center text-sm" data-testid="cart-qty">{i.qty}</span>
                    <button className="p-1.5" onClick={() => setQty(i.variant_id, i.qty + 1)} data-testid="cart-qty-plus"><Plus className="w-3 h-3" /></button>
                  </div>
                  <span className="text-sm font-bold">{fmt(i.price[currency] * i.qty, currency)}</span>
                </div>
              </div>
              <button onClick={() => remove(i.variant_id)} className="self-start opacity-50 hover:opacity-100" data-testid="cart-remove-btn"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="border-t border-line px-6 py-5 space-y-4">
            <CouponBox />
            <Totals quote={quote} />
            <button data-testid="cart-checkout-btn" onClick={() => { setOpen(false); nav("/checkout"); }} className="btn-theme w-full py-3.5 font-bold uppercase tracking-wider text-sm">Iniciar compra</button>
          </div>
        )}
      </aside>
    </div>
  );
}
