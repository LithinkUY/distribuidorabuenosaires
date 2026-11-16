import axios from "axios";

const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const envBackend = (process.env.REACT_APP_BACKEND_URL || "").trim().replace(/\/+$/, "");

export const BACKEND =
  envBackend && (isLocalHost || !envBackend.includes("localhost"))
    ? envBackend
    : isLocalHost
      ? "http://localhost:8000"
      : "";

export const api = axios.create({ baseURL: `${BACKEND}/api` });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const cfg = err?.config;
    if (cfg && !err.response && (cfg._retryCount || 0) < 2) {
      cfg._retryCount = (cfg._retryCount || 0) + 1;
      await new Promise((res) => setTimeout(res, 600));
      return api(cfg);
    }
    return Promise.reject(err);
  }
);

export const img = (s) => (!s ? "" : s.startsWith("/api") ? BACKEND + s : s);

export const fmt = (n, cur) =>
  cur === "USD"
    ? `US$ ${Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$ ${Math.round(n || 0).toLocaleString("es-AR")}`;

export const priceOf = (v, cur) => {
  if (!v) return { regular: 0, sale: 0, final: 0 };
  const regular = cur === "USD" ? v.price_usd : v.price_ars;
  const sale = cur === "USD" ? v.sale_usd : v.sale_ars;
  return { regular, sale, final: sale || regular, pct: sale ? Math.round((1 - sale / regular) * 100) : 0 };
};

export const errMsg = (e) => {
  const d = e?.response?.data?.detail;
  if (!d) return e?.message || "Ocurrió un error";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x.msg).join(" ");
  return String(d);
};

export const uploadImage = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post("/upload", fd);
  return data.url;
};

export const FONTS = ["Outfit", "Inter", "Montserrat", "Roboto", "Playfair Display", "Poppins", "Space Grotesk", "Manrope", "DM Sans"];
export const STATUSES = ["Pendiente", "Pagado", "En Preparación", "Enviado", "Entregado", "Cancelado"];
export const PAY_LABEL = { mercadopago: "Mercado Pago", cod: "Contra entrega", transfer: "Transferencia" };
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
