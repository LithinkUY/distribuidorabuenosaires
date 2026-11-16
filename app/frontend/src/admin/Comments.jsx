import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, XCircle, Star, Clock } from "lucide-react";
import { toast } from "sonner";
import { api, img, errMsg } from "@/lib/api";
import { PageHeader, Panel, Text, Area, Select, ImageField, Btn } from "@/admin/ui";

const STATUS_BADGE = {
  Pendiente: "bg-amber-100 text-amber-800 border-amber-200",
  Aprobado: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Rechazado: "bg-red-100 text-red-700 border-red-200",
};

const EMPTY_COMMENT = {
  name: "",
  vehicle: "",
  rating: 5,
  comment: "",
  photo: "",
  status: "Aprobado",
};

export default function Comments() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(null);

  const load = () => {
    api.get("/admin/comments").then((r) => setItems(r.data)).catch((e) => toast.error(errMsg(e)));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (edit.id) {
        await api.put(`/admin/comments/${edit.id}`, edit);
        toast.success("Comentario actualizado");
      } else {
        await api.post("/admin/comments", edit);
        toast.success("Comentario creado");
      }
      setEdit(null);
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const setStatus = async (cid, status) => {
    try {
      await api.put(`/admin/comments/${cid}/status`, { status });
      toast.success(`Comentario marcado como ${status.toLowerCase()}`);
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const remove = async (cid) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try {
      await api.delete(`/admin/comments/${cid}`);
      toast.success("Comentario eliminado");
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const pendingCount = items.filter((c) => c.status === "Pendiente").length;
  const approvedCount = items.filter((c) => c.status === "Aprobado").length;
  const rejectedCount = items.filter((c) => c.status === "Rechazado").length;

  const filtered = items.filter((c) => {
    if (filter && c.status !== filter) return false;
    if (q) {
      const ql = q.toLowerCase();
      return (
        (c.name || "").toLowerCase().includes(ql) ||
        (c.comment || "").toLowerCase().includes(ql) ||
        (c.vehicle || "").toLowerCase().includes(ql)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6" data-testid="comments-admin">
      <PageHeader
        title="Comentarios del Home"
        desc="Auditá y aprobá los comentarios enviados por clientes, o creá y editá comentarios con foto."
      >
        <Btn onClick={() => setEdit({ ...EMPTY_COMMENT })} data-testid="comment-new-btn">
          <Plus className="w-4 h-4" />Nuevo comentario
        </Btn>
      </PageHeader>

      {edit && (
        <Panel title={edit.id ? "Editar comentario" : "Nuevo comentario"}>
          <div className="grid md:grid-cols-[auto_1fr] gap-6">
            <ImageField
              label="Foto del comentario (opcional)"
              value={edit.photo}
              onChange={(v) => setEdit({ ...edit, photo: v })}
              tid="admin-comment-photo"
            />
            <div className="space-y-4">
              <div className="grid sm:grid-cols-4 gap-3">
                <Text
                  label="Nombre del cliente *"
                  value={edit.name}
                  onChange={(v) => setEdit({ ...edit, name: v })}
                  tid="admin-comment-name"
                  placeholder="Ej: Lucía Pérez"
                />
                <Text
                  label="Vehículo / Subtítulo"
                  value={edit.vehicle}
                  onChange={(v) => setEdit({ ...edit, vehicle: v })}
                  tid="admin-comment-vehicle"
                  placeholder="Ej: VW Gol Trend · Línea Sport"
                />
                <Select
                  label="Calificación"
                  value={edit.rating}
                  onChange={(v) => setEdit({ ...edit, rating: Number(v) })}
                  tid="admin-comment-rating"
                  options={[
                    { value: 5, label: "★★★★★ (5 estrellas)" },
                    { value: 4, label: "★★★★☆ (4 estrellas)" },
                    { value: 3, label: "★★★☆☆ (3 estrellas)" },
                    { value: 2, label: "★★☆☆☆ (2 estrellas)" },
                    { value: 1, label: "★☆☆☆☆ (1 estrella)" },
                  ]}
                />
                <Select
                  label="Estado"
                  value={edit.status}
                  onChange={(v) => setEdit({ ...edit, status: v })}
                  tid="admin-comment-status"
                  options={[
                    { value: "Aprobado", label: "Aprobado (visible en Home)" },
                    { value: "Pendiente", label: "Pendiente de auditoría" },
                    { value: "Rechazado", label: "Rechazado (oculto)" },
                  ]}
                />
              </div>
              <Area
                label="Comentario *"
                rows={3}
                value={edit.comment}
                onChange={(v) => setEdit({ ...edit, comment: v })}
                tid="admin-comment-text"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Btn onClick={save} data-testid="admin-comment-save-btn">Guardar comentario</Btn>
            <Btn variant="outline" onClick={() => setEdit(null)}>Cancelar</Btn>
          </div>
        </Panel>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            ["", `Todos (${items.length})`],
            ["Pendiente", `Pendientes (${pendingCount})`],
            ["Aprobado", `Aprobados (${approvedCount})`],
            ["Rechazado", `Rechazados (${rejectedCount})`],
          ].map(([k, label]) => (
            <Btn
              key={k}
              variant={filter === k ? "dark" : "outline"}
              onClick={() => setFilter(k)}
              data-testid={`comments-filter-${k || "all"}`}
            >
              {label}
            </Btn>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por cliente, vehículo o texto..."
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white w-full sm:w-72"
          data-testid="comments-search-input"
        />
      </div>

      <div className="space-y-3" data-testid="admin-comments-list">
        {filtered.length === 0 && (
          <Panel>
            <p className="text-sm text-zinc-500 text-center py-6">No hay comentarios para mostrar en este filtro.</p>
          </Panel>
        )}
        {filtered.map((c) => (
          <div
            key={c.id}
            data-testid={`admin-comment-row-${c.id}`}
            className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start justify-between"
          >
            <div className="flex gap-4 items-start min-w-0 flex-1">
              {c.photo ? (
                <img
                  src={img(c.photo)}
                  alt={c.name}
                  className="w-20 h-20 rounded-lg object-cover border shrink-0 bg-zinc-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 grid place-items-center text-[11px] text-zinc-400 shrink-0 text-center px-1">
                  Sin foto
                </div>
              )}
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm">{c.name}</span>
                  {c.vehicle && <span className="text-xs text-zinc-500">· {c.vehicle}</span>}
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_BADGE[c.status] || STATUS_BADGE.Pendiente}`}>
                    {c.status}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {c.created_at ? new Date(c.created_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : ""}
                  </span>
                </div>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`w-4 h-4 ${n <= (c.rating || 5) ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                  ))}
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed">{c.comment}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
              {c.status !== "Aprobado" && (
                <button
                  type="button"
                  onClick={() => setStatus(c.id, "Aprobado")}
                  data-testid={`approve-comment-${c.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                  title="Aceptar y publicar en el Home"
                >
                  <Check className="w-3.5 h-3.5" />Aceptar
                </button>
              )}
              {c.status !== "Rechazado" && (
                <button
                  type="button"
                  onClick={() => setStatus(c.id, "Rechazado")}
                  data-testid={`reject-comment-${c.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                  title="Rechazar / Ocultar del Home"
                >
                  <XCircle className="w-3.5 h-3.5" />Rechazar
                </button>
              )}
              {c.status !== "Pendiente" && (
                <button
                  type="button"
                  onClick={() => setStatus(c.id, "Pendiente")}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  title="Marcar como Pendiente"
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setEdit({ ...c })}
                data-testid={`edit-comment-${c.id}`}
                className="p-2 rounded-md border border-zinc-200 hover:bg-zinc-100"
                title="Editar comentario / foto"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(c.id)}
                data-testid={`delete-comment-${c.id}`}
                className="p-2 rounded-md text-red-600 hover:bg-red-50"
                title="Eliminar comentario"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
