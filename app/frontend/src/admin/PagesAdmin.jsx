import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, ExternalLink, Link2 } from "lucide-react";
import { toast } from "sonner";
import { api, errMsg, uid } from "@/lib/api";
import { useSite } from "@/context/ThemeContext";
import { PageHeader, Panel, Text, Area, Toggle, Btn } from "@/admin/ui";

const EMPTY = { title: "", slug: "", content: "<h2>Título</h2><p>Contenido…</p>", active: true, show_in_footer: true };

export default function PagesAdmin() {
  const { reload } = useSite();
  const [pages, setPages] = useState([]);
  const [edit, setEdit] = useState(null);
  const load = () => api.get("/admin/pages").then((r) => setPages(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (edit.id) await api.put(`/admin/pages/${edit.id}`, edit); else await api.post("/admin/pages", edit);
      await reload();
      toast.success("Página guardada"); setEdit(null); load();
    } catch (e) { toast.error(errMsg(e)); }
  };
  const del = async (p) => { if (!window.confirm(`¿Eliminar "${p.title}"?`)) return; await api.delete(`/admin/pages/${p.id}`); await reload(); load(); };
  const link = async (p, where) => {
    const { data: s } = await api.get("/admin/settings");
    const item = { id: uid(), label: p.title, url: `/pagina/${p.slug}` };
    const body = where === "menu" ? { menu: [...s.menu, { ...item, children: [] }] }
      : { footer: { ...s.footer, columns: s.footer.columns.length ? s.footer.columns.map((c, i) => (i === s.footer.columns.length - 1 ? { ...c, links: [...c.links, item] } : c)) : [{ id: uid(), title: "Información", links: [item] }] } };
    await api.put("/admin/settings", body);
    await reload();
    toast.success(`Vinculada al ${where === "menu" ? "menú" : "footer"}`);
  };

  return (
    <div className="space-y-6" data-testid="pages-admin">
      <PageHeader title="Páginas extra" desc="Páginas informativas: Nosotros, Mayoristas, Contacto…"><Btn onClick={() => setEdit({ ...EMPTY })} data-testid="page-new-btn"><Plus className="w-4 h-4" />Nueva página</Btn></PageHeader>
      {edit && (
        <Panel title={edit.id ? "Editar página" : "Nueva página"}>
          <div className="grid sm:grid-cols-2 gap-4"><Text label="Título" value={edit.title} onChange={(v) => setEdit({ ...edit, title: v })} tid="page-title" />
            <Text label="Slug (URL)" value={edit.slug} onChange={(v) => setEdit({ ...edit, slug: v })} tid="page-slug" hint="Vacío = se genera del título" /></div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Area label="Contenido (HTML enriquecido)" value={edit.content} onChange={(v) => setEdit({ ...edit, content: v })} rows={12} mono tid="page-content" />
            <div><p className="text-sm font-medium text-zinc-700 mb-1">Vista previa</p><div className="rich border rounded-lg p-4 h-[290px] overflow-auto bg-zinc-50" dangerouslySetInnerHTML={{ __html: edit.content }} /></div>
          </div>
          <div className="flex gap-6"><Toggle label="Publicada" checked={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} tid="page-active" /></div>
          <div className="flex gap-2"><Btn onClick={save} data-testid="page-save-btn">Guardar</Btn><Btn variant="outline" onClick={() => setEdit(null)}>Cancelar</Btn></div>
        </Panel>
      )}
      <Panel>
        <table className="w-full text-sm"><thead><tr className="text-left text-zinc-500 border-b"><th className="py-2">Título</th><th>URL</th><th>Estado</th><th></th></tr></thead>
          <tbody>{pages.map((p) => (
            <tr key={p.id} className="border-b last:border-0" data-testid={`page-row-${p.slug}`}>
              <td className="py-3 font-semibold">{p.title}</td><td className="font-mono text-xs">/pagina/{p.slug}</td><td>{p.active ? "Publicada" : "Borrador"}</td>
              <td className="text-right whitespace-nowrap">
                <Btn variant="outline" className="!py-1 !px-2 mr-1" onClick={() => link(p, "menu")} data-testid="page-link-menu"><Link2 className="w-3.5 h-3.5" />Menú</Btn>
                <Btn variant="outline" className="!py-1 !px-2 mr-1" onClick={() => link(p, "footer")} data-testid="page-link-footer"><Link2 className="w-3.5 h-3.5" />Footer</Btn>
                <a href={`/pagina/${p.slug}`} target="_blank" rel="noreferrer" className="inline-flex p-2"><ExternalLink className="w-4 h-4" /></a>
                <button className="p-2" onClick={() => setEdit(p)} data-testid="page-edit-btn"><Pencil className="w-4 h-4" /></button>
                <button className="p-2 text-red-600" onClick={() => del(p)} data-testid="page-delete-btn"><Trash2 className="w-4 h-4" /></button>
              </td></tr>))}</tbody></table>
      </Panel>
    </div>
  );
}
