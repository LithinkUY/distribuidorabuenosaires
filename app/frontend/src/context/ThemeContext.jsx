import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, img } from "@/lib/api";

const ThemeCtx = createContext(null);
export const useSite = () => useContext(ThemeCtx);

export const themeVars = (t = {}) => ({
  "--primary": t.primary, "--secondary": t.secondary, "--bg-main": t.bg_main, "--bg-card": t.bg_card,
  "--bg-header": t.bg_header, "--header-text": t.header_text, "--bg-footer": t.bg_footer, "--footer-text": t.footer_text,
  "--text-main": t.text_main, "--btn": t.btn, "--btn-text": t.btn_text, "--sale": t.sale,
  "--radius": `${t.radius ?? 6}px`, "--font-family": `"${t.font || "Outfit"}", sans-serif`,
});

const loadFont = (font) => {
  const id = "gf-" + font.replace(/\s/g, "-");
  if (document.getElementById(id)) return;
  const l = document.createElement("link");
  l.id = id; l.rel = "stylesheet";
  l.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s/g, "+")}:wght@300;400;500;600;700;800&display=swap`;
  document.head.appendChild(l);
};

const setTag = (sel, create, attr, val) => {
  let el = document.head.querySelector(sel);
  if (!el) { el = create(); document.head.appendChild(el); }
  el.setAttribute(attr, val);
};

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [preview, setPreview] = useState(null);

  const reload = useCallback(async () => {
    try {
      const { data } = await api.get("/settings");
      setSettings(data);
      setPreview(null);
    } catch (e) {
      console.warn("Settings load warning:", e?.message);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const theme = preview || settings?.theme;
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(themeVars(theme)).forEach(([k, v]) => v && root.style.setProperty(k, v));
    loadFont(theme.font || "Outfit");
  }, [theme]);

  useEffect(() => {
    if (!settings) return;
    const id = settings.identity || {};
    document.title = id.site_title || "Tienda";
    setTag('meta[name="description"]', () => Object.assign(document.createElement("meta"), { name: "description" }), "content", id.meta_description || "");
    if (id.favicon) setTag('link[rel="icon"]', () => Object.assign(document.createElement("link"), { rel: "icon" }), "href", img(id.favicon));
    let st = document.getElementById("custom-css");
    if (!st) { st = document.createElement("style"); st.id = "custom-css"; document.head.appendChild(st); }
    st.textContent = settings.custom_css || "";
  }, [settings]);

  return <ThemeCtx.Provider value={{ settings, reload, setPreview, theme }}>{children}</ThemeCtx.Provider>;
}
