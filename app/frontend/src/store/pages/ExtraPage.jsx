import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";

export default function ExtraPage({ notFound }) {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  useEffect(() => {
    if (notFound) { setP(false); return; }
    api.get(`/pages/${slug}`).then((r) => setP(r.data)).catch(() => setP(false));
  }, [slug, notFound]);
  if (p === null) return <div className="py-32 text-center text-ink-muted">Cargando…</div>;
  if (!p) return <div className="py-32 text-center space-y-3" data-testid="page-not-found"><h1 className="text-4xl font-bold">404</h1><p>No encontramos esta página.</p><Link to="/" className="underline">Volver al inicio</Link></div>;
  return (
    <article className="max-w-3xl mx-auto px-4 py-16" data-testid={`extra-page-${p.slug}`}>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-8">{p.title}</h1>
      <div className="rich text-base" dangerouslySetInnerHTML={{ __html: p.content }} />
    </article>
  );
}
