import { useCallback, useEffect, useRef, useState } from "react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Upload, X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import cloneDeep from "lodash/cloneDeep";
import setWith from "lodash/setWith";
import { Switch } from "@/components/ui/switch";
import { api, img, uploadImage, errMsg } from "@/lib/api";
import { useSite } from "@/context/ThemeContext";

export const inputCls = "w-full border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900";

export function PageHeader({ title, desc, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>{desc && <p className="text-sm text-zinc-500 mt-1">{desc}</p>}</div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

export const Panel = ({ title, children, actions, className = "" }) => (
  <section className={`bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4 ${className}`}>
    {(title || actions) && <div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-base">{title}</h2>{actions}</div>}
    {children}
  </section>
);

export const Field = ({ label, children, hint }) => (
  <label className="block text-sm space-y-1"><span className="font-medium text-zinc-700">{label}</span>{children}{hint && <span className="block text-xs text-zinc-400">{hint}</span>}</label>
);

export const Text = ({ label, value, onChange, type = "text", tid, hint, ...rest }) => (
  <Field label={label} hint={hint}>
    <input data-testid={tid} type={type} value={value ?? ""} onChange={(e) => onChange(type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} className={inputCls} {...rest} />
  </Field>
);

export const Area = ({ label, value, onChange, tid, rows = 4, mono }) => (
  <Field label={label}><textarea data-testid={tid} rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${mono ? "font-mono text-xs" : ""}`} /></Field>
);

export const Select = ({ label, value, onChange, options, tid }) => (
  <Field label={label}>
    <select data-testid={tid} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </Field>
);

export const Toggle = ({ label, checked, onChange, tid }) => (
  <label className="flex items-center justify-between gap-3 text-sm py-1"><span className="font-medium text-zinc-700">{label}</span>
    <Switch data-testid={tid} checked={!!checked} onCheckedChange={onChange} /></label>
);

export function ColorField({ label, value, onChange, tid }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2 border border-zinc-300 rounded-md px-2 py-1.5 bg-white">
        <input type="color" data-testid={tid} value={/^#[0-9a-f]{6}$/i.test(value || "") ? value : "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent" />
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="#000000 o vacío" className="flex-1 text-sm font-mono outline-none" data-testid={`${tid}-hex`} />
      </div>
    </Field>
  );
}

export function ImageField({ label, value, onChange, tid, small }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    try { onChange(await uploadImage(file)); toast.success("Imagen subida"); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <div className={`${small ? "w-14 h-14" : "w-24 h-24"} rounded-lg border border-dashed border-zinc-300 bg-zinc-50 overflow-hidden grid place-items-center shrink-0`}>
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : value ? <img src={img(value)} alt="" className="w-full h-full object-cover" data-testid={`${tid}-preview`} /> : <Upload className="w-5 h-5 text-zinc-400" />}
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <input ref={ref} type="file" accept="image/*" hidden data-testid={`${tid}-input`} onChange={(e) => pick(e.target.files[0])} />
          <div className="flex gap-2">
            <button type="button" onClick={() => ref.current.click()} data-testid={`${tid}-upload-btn`} className="text-xs font-semibold border border-zinc-300 rounded-md px-3 py-1.5 hover:bg-zinc-100">Subir desde PC</button>
            {value && <button type="button" onClick={() => onChange("")} className="text-xs text-red-600" data-testid={`${tid}-clear`}>Quitar</button>}
          </div>
          {!small && <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="o pegá una URL" className="text-xs border border-zinc-200 rounded px-2 py-1 w-full" />}
        </div>
      </div>
    </Field>
  );
}

export function ImagesField({ label, value = [], onChange, tid }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const pick = async (files) => {
    setBusy(true);
    try {
      const urls = [];
      for (const f of files) urls.push(await uploadImage(f));
      onChange([...value, ...urls]);
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <div key={src + i} className="relative w-24 h-24 rounded-lg overflow-hidden border group">
            <img src={img(src)} alt="" className="w-full h-full object-cover" />
            {i === 0 && <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center">Principal</span>}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow"><X className="w-3 h-3" /></button>
            {i > 0 && <button type="button" onClick={() => onChange([src, ...value.filter((_, j) => j !== i)])} className="absolute top-1 left-1 bg-white text-[9px] rounded px-1 opacity-0 group-hover:opacity-100">★</button>}
          </div>
        ))}
        <button type="button" data-testid={`${tid}-upload-btn`} onClick={() => ref.current.click()} className="w-24 h-24 rounded-lg border-2 border-dashed border-zinc-300 grid place-items-center text-zinc-400 hover:border-zinc-500">
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
        </button>
        <input ref={ref} type="file" multiple accept="image/*" hidden data-testid={`${tid}-input`} onChange={(e) => pick([...e.target.files])} />
      </div>
    </Field>
  );
}

function SortRow({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : "auto" }}
      className={`flex items-start gap-2 bg-white border border-zinc-200 rounded-lg p-3 ${isDragging ? "shadow-xl" : ""}`}>
      <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-700 pt-1.5" data-testid={`drag-handle-${id}`}><GripVertical className="w-4 h-4" /></button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export function SortableList({ items, onChange, render, tid }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const end = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const a = items.findIndex((i) => i.id === active.id), b = items.findIndex((i) => i.id === over.id);
    onChange(arrayMove(items, a, b));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={end}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2" data-testid={tid}>{items.map((it, idx) => <SortRow key={it.id} id={it.id}>{render(it, idx)}</SortRow>)}</div>
      </SortableContext>
    </DndContext>
  );
}

export function useSettings() {
  const { reload } = useSite();
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { api.get("/admin/settings").then((r) => setS(r.data)); }, []);
  const set = useCallback((path, val) => setS((prev) => setWith(cloneDeep(prev), path, val, Object)), []);
  const save = async (keys) => {
    setSaving(true);
    try {
      const body = Object.fromEntries(keys.map((k) => [k, s[k]]));
      const { data } = await api.put("/admin/settings", body);
      setS(data);
      await reload();
      toast.success("Cambios guardados");
    } catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  };
  return { s, setS, set, save, saving };
}

export const SaveBtn = ({ onClick, saving, tid = "save-btn", label = "Guardar cambios" }) => (
  <button data-testid={tid} onClick={onClick} disabled={saving} className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-zinc-800 disabled:opacity-50">
    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{label}
  </button>
);

export const Btn = ({ children, variant = "dark", className = "", ...p }) => (
  <button {...p} className={`inline-flex items-center justify-center gap-2 text-sm font-semibold px-3.5 py-2 rounded-md transition-colors disabled:opacity-50 ${variant === "dark" ? "bg-zinc-900 text-white hover:bg-zinc-800" : variant === "danger" ? "text-red-600 hover:bg-red-50" : "border border-zinc-300 hover:bg-zinc-100"} ${className}`}>{children}</button>
);

export const Loading = () => <div className="py-20 text-center text-sm text-zinc-500">Cargando…</div>;
