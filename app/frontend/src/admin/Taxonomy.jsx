import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { api, img, errMsg } from "@/lib/api";
import { PageHeader, Panel, Btn, ImageField, inputCls } from "@/admin/ui";

function Crud({ name, title, withImage, withParent, withOrder, parents = [], onChange }) {
  const [items, setItems] = useState([]);
  const [edit, setEdit] = useState(null);
  const load = () => api.get(`/admin/${name}`).then((r) => { setItems(r.data); onChange?.(r.data); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [name]);
  const list = withParent === "only" ? items.filter((i) => i.parent_id) : withParent === "none" ? items.filter((i) => !i.parent_id) : items;
  const save = async () => {
    if (!edit.name?.trim()) return toast.error("El nombre es obligatorio");
    if (withParent === "only" && !edit.parent_id) return toast.error("Elegí la categoría padre");
    try {
      const body = { ...edit, order: Number(edit.order || 0), parent_id: withParent === "only" ? edit.parent_id : withParent === "none" ? null : edit.parent_id };
      if (edit.id) await api.put(`/admin/${name}/${edit.id}`, body); else await api.post(`/admin/${name}`, body);
      toast.success("Guardado"); setEdit(null); load();
    } catch (e) { toast.error(errMsg(e)); }
  };
  const del = async (i) => { if (!window.confirm(`¿Eliminar ${i.name}?`)) return; await api.delete(`/admin/${name}/${i.id}`); load(); };
  const tid = `${title.toLowerCase().replace(/\s/g, "-")}`;
  return (
    <Panel title={title} actions={<Btn variant="outline" onClick={() => setEdit({ name: "", image: "", order: list.length + 1, parent_id: "" })} data-testid={`${tid}-new-btn`}><Plus className="w-4 h-4" />Nuevo</Btn>}>
      {edit && (
        <div className="border border-zinc-200 rounded-lg p-4 space-y-3 bg-zinc-50" data-testid={`${tid}-form`}>
          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-sm flex-1 min-w-[160px]"><span className="font-medium">Nombre</span><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={inputCls} data-testid={`${tid}-name-input`} /></label>
            {withParent === "only" && <label className="text-sm flex-1 min-w-[160px]"><span className="font-medium">Categoría padre</span>
              <select value={edit.parent_id || ""} onChange={(e) => setEdit({ ...edit, parent_id: e.target.value })} className={inputCls} data-testid={`${tid}-parent`}><option value="">Elegir…</option>{parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
            {withOrder && <label className="text-sm w-24"><span className="font-medium">Orden</span><input type="number" value={edit.order} onChange={(e) => setEdit({ ...edit, order: e.target.value })} className={inputCls} /></label>}
          </div>
          {withImage && <ImageField label="Imagen" value={edit.image} onChange={(v) => setEdit({ ...edit, image: v })} tid={`${tid}-img`} />}
          <div className="flex gap-2"><Btn onClick={save} data-testid={`${tid}-save-btn`}><Check className="w-4 h-4" />Guardar</Btn><Btn variant="outline" onClick={() => setEdit(null)}><X className="w-4 h-4" />Cancelar</Btn></div>
        </div>
      )}
      <div className="divide-y divide-zinc-100">
        {list.map((i) => (
          <div key={i.id} className="flex items-center gap-3 py-2.5" data-testid={`${tid}-row-${i.slug}`}>
            {withImage && (i.image ? <img src={img(i.image)} alt="" className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-zinc-100" />)}
            <div className="flex-1"><p className="font-semibold text-sm">{i.name}</p><p className="text-xs text-zinc-500">/{i.slug}{withParent === "only" && ` · en ${parents.find((p) => p.id === i.parent_id)?.name || "-"}`}</p></div>
            <button onClick={() => setEdit(i)} className="p-2" data-testid={`${tid}-edit-btn`}><Pencil className="w-4 h-4" /></button>
            <button onClick={() => del(i)} className="p-2 text-red-600" data-testid={`${tid}-delete-btn`}><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        {!list.length && <p className="text-sm text-zinc-500 py-3">Sin elementos.</p>}
      </div>
    </Panel>
  );
}

export default function Taxonomy() {
  const [cats, setCats] = useState([]);
  return (
    <div className="space-y-6" data-testid="taxonomy-admin">
      <PageHeader title="Categorías, marcas y tipos" desc="Administrá la estructura del catálogo." />
      <div className="grid lg:grid-cols-2 gap-6">
        <Crud name="categories" title="Categorías" withImage withOrder withParent="none" onChange={setCats} />
        <Crud key={cats.length} name="categories" title="Subcategorías" withImage withOrder withParent="only" parents={cats.filter((c) => !c.parent_id)} />
        <Crud name="brands" title="Marcas" withImage />
        <Crud name="types" title="Tipos de producto" />
      </div>
    </div>
  );
}
