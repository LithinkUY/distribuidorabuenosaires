import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, MessageSquarePlus, Camera, X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api, img, uploadImage, errMsg } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/store/ProductCard";

const ALIGN = { left: "items-start text-left", center: "items-center text-center", right: "items-end text-right" };

export function Hero({ config }) {
  const slides = config.slides || [];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2 || !config.autoplay) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), config.autoplay * 1000);
    return () => clearInterval(t);
  }, [slides.length, config.autoplay]);
  if (!slides.length) return null;

  const wMode = config.width_mode || "full";
  const isBoxed = wMode !== "full";
  const wrapperStyle = {
    height: config.height || 520,
    maxWidth:
      wMode === "contained"
        ? "1280px"
        : wMode === "custom_px"
          ? `${config.max_width || 1280}px`
          : wMode === "custom_pct"
            ? `${config.width_pct || 90}%`
            : "100%",
    width: "100%",
    margin: isBoxed ? `${config.margin_y ?? 16}px auto` : "0 auto",
    borderRadius: isBoxed ? `${config.rounded ?? 12}px` : "0px",
  };
  const fit = config.object_fit || "cover";

  return (
    <div className={wMode === "contained" ? "px-4 sm:px-6 lg:px-8" : ""}>
      <section data-testid="home-hero" className="relative overflow-hidden bg-zinc-900" style={wrapperStyle}>
        {slides.map((s, idx) => (
          <div key={s.id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100 z-10" : "opacity-0"}`}>
            <img src={img(s.image)} alt="" className="absolute inset-0 w-full h-full" style={{ objectFit: fit }} />
            <div className="absolute inset-0 bg-black" style={{ opacity: (s.overlay ?? 40) / 100 }} />
            <div className={`relative h-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col justify-center gap-5 text-white ${ALIGN[s.align] || ALIGN.left}`}>
              {idx === i && <>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-3xl fade-up leading-[1.05]">{s.title}</h1>
                {s.subtitle && <p className="text-base md:text-lg opacity-90 max-w-xl fade-up" style={{ animationDelay: ".15s" }}>{s.subtitle}</p>}
                {s.btn_text && <Link to={s.btn_link || "/catalogo"} data-testid={`hero-cta-${idx}`} className="px-8 py-3.5 font-bold uppercase tracking-wider text-sm fade-up hover:-translate-y-0.5 transition-transform"
                  style={{ background: s.btn_bg, color: s.btn_color, borderRadius: "var(--radius)", animationDelay: ".3s" }}>{s.btn_text}</Link>}
              </>}
            </div>
          </div>
        ))}
        {slides.length > 1 && <>
          <button data-testid="hero-prev" onClick={() => setI((i - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 backdrop-blur text-white grid place-items-center hover:bg-white/40"><ChevronLeft /></button>
          <button data-testid="hero-next" onClick={() => setI((i + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 backdrop-blur text-white grid place-items-center hover:bg-white/40"><ChevronLeft className="rotate-180 hidden" /><ChevronRight /></button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((s, idx) => <button key={s.id} onClick={() => setI(idx)} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-white" : "w-3 bg-white/50"}`} />)}
          </div>
        </>}
      </section>
    </div>
  );
}

const Title = ({ children }) => <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">{children}</h2>;

export function Categories({ title, config }) {
  const items = config.items || [];
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="home-categories">
      <Title>{title}</Title>
      <div className={`grid gap-4 sm:gap-6 grid-cols-2 ${items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {items.map((c, idx) => (
          <Link key={c.id} to={c.link || "/catalogo"} data-testid={`home-category-${idx}`} className={`group relative overflow-hidden aspect-[4/5] ${idx === 0 && items.length === 3 ? "col-span-2 lg:col-span-1" : ""}`} style={{ borderRadius: "var(--radius)" }}>
            <img src={img(c.image)} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute bottom-5 left-5 text-white text-lg sm:text-xl font-bold uppercase tracking-wider">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ProductsSection({ title, config, id }) {
  const [items, setItems] = useState([]);
  const row = useRef(null);
  useEffect(() => {
    const params = { limit: config.limit || 8 };
    if (config.source === "tag") params.tag = config.value;
    if (config.source === "category") params.category = config.value;
    if (config.source === "brand") params.brand = config.value;
    if (config.source === "sale") params.on_sale = true;
    api.get("/products", { params }).then((r) => setItems(r.data));
  }, [config.source, config.value, config.limit]);
  if (!items.length) return null;
  const scroll = (d) => row.current?.scrollBy({ left: d * row.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid={`home-products-${id}`}>
      <div className="flex items-end justify-between"><Title>{title}</Title>
        {config.layout === "carousel" && <div className="flex gap-2 mb-8">
          <button onClick={() => scroll(-1)} className="btn-outline-theme w-10 h-10 grid place-items-center" data-testid="carousel-prev"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => scroll(1)} className="btn-outline-theme w-10 h-10 grid place-items-center" data-testid="carousel-next"><ChevronRight className="w-4 h-4" /></button>
        </div>}
      </div>
      {config.layout === "carousel" ? (
        <div ref={row} className="flex gap-5 overflow-x-auto snap-x no-scrollbar pb-2">
          {items.map((p) => <div key={p.id} className="snap-start shrink-0 w-[70%] sm:w-[45%] lg:w-[23.5%]"><ProductCard p={p} /></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </section>
  );
}

export function Banner({ config, id }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid={`home-banner-${id}`}>
      <div className="relative overflow-hidden flex items-center" style={{ height: config.height || 320, borderRadius: "var(--radius)" }}>
        <img src={img(config.image)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black" style={{ opacity: (config.overlay ?? 40) / 100 }} />
        <div className="relative px-8 sm:px-14 text-white max-w-xl space-y-4">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{config.title}</h3>
          {config.text && <p className="opacity-90">{config.text}</p>}
          {config.btn_text && <Link to={config.link || "/"} className="inline-block bg-white text-black px-7 py-3 font-bold text-sm uppercase tracking-wider" style={{ borderRadius: "var(--radius)" }}>{config.btn_text}</Link>}
        </div>
      </div>
    </section>
  );
}

export function TextBlock({ config }) {
  return <section className="max-w-4xl mx-auto px-4 py-12 rich text-center" dangerouslySetInnerHTML={{ __html: config.html || "" }} />;
}

export function CommentsSection({ title = "Comentarios de clientes", config = {}, id }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef(null);
  const [f, setF] = useState({ name: "", email: "", vehicle: "", rating: 5, comment: "", photo: "" });

  useEffect(() => {
    api.get("/comments", { params: { limit: config.limit || 12 } }).then((r) => setItems(r.data)).catch(() => {});
  }, [config.limit]);
  useEffect(() => {
    if (user) {
      setF((prev) => ({ ...prev, name: prev.name || user.name || "", email: prev.email || user.email || "" }));
    }
  }, [user]);

  const pickPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setF((prev) => ({ ...prev, photo: url }));
      toast.success("Foto cargada");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/comments", f);
      setSubmitted(true);
      setOpenForm(false);
      setF({ name: user?.name || "", email: user?.email || "", vehicle: "", rating: 5, comment: "", photo: "" });
      toast.success("¡Comentario enviado! Será publicado tras su aprobación.");
    } catch (er) {
      toast.error(errMsg(er));
    } finally {
      setSending(false);
    }
  };

  const avg = items.length ? (items.reduce((a, b) => a + (Number(b.rating) || 5), 0) / items.length).toFixed(1) : "5.0";

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" data-testid={`home-comments-${id || "main"}`}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title || "Comentarios de clientes"}</h2>
          {config.subtitle !== "" && (
            <p className="text-sm text-ink-muted mt-1">{config.subtitle || "Experiencias reales de quienes ya renovaron el interior de su auto"}</p>
          )}
          {items.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-sm">
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold">{avg}</span>
              <span className="text-ink-muted">· {items.length} {items.length === 1 ? "comentario verificado" : "comentarios verificados"}</span>
            </div>
          )}
        </div>
        {config.allow_submit !== false && (
          <button
            type="button"
            onClick={() => { setSubmitted(false); setOpenForm(!openForm); }}
            data-testid="open-comment-form-btn"
            className="btn-theme px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2"
          >
            <MessageSquarePlus className="w-4 h-4" />
            {openForm ? "Cerrar formulario" : "Dejar mi comentario"}
          </button>
        )}
      </div>

      {submitted && (
        <div className="card-theme p-4 mb-8 border border-emerald-300 bg-emerald-50/70 text-emerald-900 flex items-center justify-between gap-3" data-testid="comment-submitted-banner">
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span><b>¡Gracias por compartir tu experiencia!</b> Tu comentario fue enviado y aparecerá en la página apenas sea auditado y aprobado por el administrador.</span>
          </div>
          <button type="button" onClick={() => setSubmitted(false)} className="text-emerald-700 hover:text-emerald-950"><X className="w-4 h-4" /></button>
        </div>
      )}

      {openForm && (
        <form onSubmit={submit} className="card-theme p-6 mb-10 space-y-4 shadow-sm border" data-testid="client-comment-form">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-lg">Agregar un comentario</h3>
              <p className="text-xs text-ink-muted">Contanos qué te pareció el producto y subí una foto opcional de cómo quedó en tu auto.</p>
            </div>
            <button type="button" onClick={() => setOpenForm(false)} className="p-1 opacity-60 hover:opacity-100"><X className="w-5 h-5" /></button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Tu nombre *</label>
              <input
                required
                data-testid="comment-name-input"
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
                placeholder="Ej: Martín Gómez"
                className="input-theme w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Vehículo / Producto (opcional)</label>
              <input
                data-testid="comment-vehicle-input"
                value={f.vehicle}
                onChange={(e) => setF({ ...f, vehicle: e.target.value })}
                placeholder="Ej: VW Amarok · Funda Eco Cuero"
                className="input-theme w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Calificación</label>
              <div className="flex items-center gap-1.5 h-9" data-testid="comment-rating-picker">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    data-testid={`comment-star-${n}`}
                    onClick={() => setF({ ...f, rating: n })}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star className={`w-6 h-6 ${n <= f.rating ? "fill-amber-400 text-amber-400" : "text-zinc-300"}`} />
                  </button>
                ))}
                <span className="text-xs font-semibold ml-1">{f.rating}/5</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Tu comentario *</label>
            <textarea
              required
              rows={3}
              data-testid="comment-text-input"
              value={f.comment}
              onChange={(e) => setF({ ...f, comment: e.target.value })}
              placeholder="Contanos cómo fue tu experiencia con la calidad, el calce y la atención..."
              className="input-theme w-full px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickPhoto(e.target.files[0])} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                data-testid="comment-photo-upload-btn"
                className="btn-outline-theme px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-2"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {f.photo ? "Cambiar foto" : "Adjuntar foto (opcional)"}
              </button>
              {f.photo && (
                <div className="flex items-center gap-2">
                  <img src={img(f.photo)} alt="Preview" className="w-12 h-12 rounded object-cover border" data-testid="comment-photo-preview" />
                  <button type="button" onClick={() => setF({ ...f, photo: "" })} className="text-xs text-red-600 underline">Quitar</button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setOpenForm(false)} className="btn-outline-theme px-4 py-2.5 text-sm font-semibold">
                Cancelar
              </button>
              <button type="submit" disabled={sending || uploading} data-testid="comment-submit-btn" className="btn-theme px-6 py-2.5 text-sm font-bold">
                {sending ? "Enviando..." : "Enviar comentario"}
              </button>
            </div>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="card-theme p-8 text-center text-ink-muted text-sm">
          Sé el primero en dejar tu comentario sobre nuestros productos.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="comments-grid">
          {items.map((c) => (
            <article key={c.id} className="card-theme overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow" data-testid={`comment-card-${c.id}`}>
              <div>
                {c.photo && (
                  <div className="relative h-52 w-full overflow-hidden bg-zinc-100 cursor-pointer group" onClick={() => setLightbox(img(c.photo))}>
                    <img src={img(c.photo)} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`w-4 h-4 ${n <= (c.rating || 5) ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                      ))}
                    </div>
                    {c.created_at && (
                      <span className="text-[11px] text-ink-muted">{new Date(c.created_at).toLocaleDateString("es-AR")}</span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">“{c.comment}”</p>
                </div>
              </div>
              <div className="px-5 pb-4 pt-2 border-t border-black/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black/10 grid place-items-center font-bold text-xs uppercase shrink-0">
                  {(c.name || "C").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{c.name}</p>
                  {c.vehicle && <p className="text-xs text-ink-muted truncate">{c.vehicle}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 grid place-items-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-3xl max-h-[85vh]">
            <button type="button" onClick={() => setLightbox(null)} className="absolute -top-10 right-0 text-white hover:opacity-80"><X className="w-7 h-7" /></button>
            <img src={lightbox} alt="" className="max-h-[85vh] w-auto rounded-lg object-contain" />
          </div>
        </div>
      )}
    </section>
  );
}

export const SECTION_COMPONENTS = { hero: Hero, categories: Categories, products: ProductsSection, banner: Banner, text: TextBlock, comments: CommentsSection };
