import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => read("cart", []));
  const [coupon, setCoupon] = useState(() => read("coupon", ""));
  const [currency, setCurrency] = useState(() => read("currency", "ARS"));
  const [open, setOpen] = useState(false);

  useEffect(() => { localStorage.setItem("cart", JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem("coupon", JSON.stringify(coupon)); }, [coupon]);
  useEffect(() => { localStorage.setItem("currency", JSON.stringify(currency)); }, [currency]);

  const add = (product, variant, qty = 1) => {
    if (!variant || variant.stock <= 0) return toast.error("Sin stock para esta variante");
    setItems((prev) => {
      const ex = prev.find((i) => i.variant_id === variant.id);
      const nextQty = Math.min((ex?.qty || 0) + qty, variant.stock);
      const line = { product_id: product.id, variant_id: variant.id, slug: product.slug, name: product.name,
        variant_name: Object.values(variant.attrs || {}).join(" / "), image: variant.image || product.images?.[0], stock: variant.stock,
        qty: nextQty, price: { ARS: variant.sale_ars || variant.price_ars, USD: variant.sale_usd || variant.price_usd } };
      return ex ? prev.map((i) => (i.variant_id === variant.id ? line : i)) : [...prev, line];
    });
    toast.success("Agregado al carrito");
    setOpen(true);
  };
  const setQty = (vid, qty) => setItems((p) => p.map((i) => (i.variant_id === vid ? { ...i, qty: Math.max(1, Math.min(qty, i.stock || 99)) } : i)));
  const remove = (vid) => setItems((p) => p.filter((i) => i.variant_id !== vid));
  const clear = () => { setItems([]); setCoupon(""); };
  const count = items.reduce((a, i) => a + i.qty, 0);

  return (
    <CartCtx.Provider value={{ items, add, setQty, remove, clear, count, coupon, setCoupon, currency, setCurrency, open, setOpen }}>
      {children}
    </CartCtx.Provider>
  );
}
