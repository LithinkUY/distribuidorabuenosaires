import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, History, X } from "lucide-react";
import { toast } from "sonner";
import { api, fmt, errMsg } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageHeader, Panel, Text, Select, Btn } from "@/admin/ui";
import { StatusBadge } from "@/admin/Orders";

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);
  const [hist, setHist] = useState(null);
  const [filter, setFilter] = useState("");
  const load = () => api.get("/admin/users").then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);
  const save = async () => {
    try {
      if (edit.id) await api.put(`/admin/users/${edit.id}`, edit); else await api.post("/admin/users", edit);
      toast.success("Usuario guardado"); setEdit(null); load();
    } catch (e) { toast.error(errMsg(e)); }
  };
  const showHist = async (u) => setHist({ u, orders: (await api.get(`/admin/users/${u.id}/orders`)).data });
  const list = users.filter((u) => !filter || u.role === filter);
  return (
    <div className="space-y-6" data-testid="users-admin">
      <PageHeader title="Usuarios" desc="Clientes y administradores">
        <Btn onClick={() => setEdit({ name: "", email: "", phone: "", password: "", role: "ADMIN" })} data-testid="user-new-btn"><Plus className="w-4 h-4" />Nuevo usuario</Btn>
      </PageHeader>
      {edit && (
        <Panel title={edit.id ? "Editar usuario" : "Nuevo usuario"}>
          <div className="grid sm:grid-cols-5 gap-3">
            <Text label="Nombre" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} tid="user-name" />
            <Text label="Email" value={edit.email} onChange={(v) => setEdit({ ...edit, email: v })} tid="user-email" disabled={!!edit.id} />
            <Text label="Teléfono" value={edit.phone} onChange={(v) => setEdit({ ...edit, phone: v })} tid="user-phone" />
            <Text label={edit.id ? "Nueva contraseña (opcional)" : "Contraseña"} type="password" value={edit.password} onChange={(v) => setEdit({ ...edit, password: v })} tid="user-password" />
            <Select label="Rol" value={edit.role} onChange={(v) => setEdit({ ...edit, role: v })} tid="user-role" options={[{ value: "ADMIN", label: "Administrador" }, { value: "CLIENTE", label: "Cliente" }]} />
          </div>
          <div className="flex gap-2"><Btn onClick={save} data-testid="user-save-btn">Guardar</Btn><Btn variant="outline" onClick={() => setEdit(null)}>Cancelar</Btn></div>
        </Panel>
      )}
      <div className="flex gap-2">{[["", "Todos"], ["CLIENTE", "Clientes"], ["ADMIN", "Administradores"]].map(([k, l]) => <Btn key={k} variant={filter === k ? "dark" : "outline"} onClick={() => setFilter(k)} data-testid={`users-filter-${k || "all"}`}>{l}</Btn>)}</div>
      <Panel>
        <table className="w-full text-sm"><thead><tr className="text-left text-zinc-500 border-b"><th className="py-2">Nombre</th><th>Email</th><th>Rol</th><th>Pedidos</th><th>Total ARS</th><th>Total USD</th><th></th></tr></thead>
          <tbody>{list.map((u) => (
            <tr key={u.id} className="border-b last:border-0" data-testid={`user-row-${u.email}`}>
              <td className="py-3 font-semibold">{u.name}</td><td>{u.email}</td><td><span className={`text-[11px] font-bold px-2 py-0.5 rounded ${u.role === "ADMIN" ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}>{u.role}</span></td>
              <td>{u.stats.orders}</td><td>{fmt(u.stats.ARS, "ARS")}</td><td>{fmt(u.stats.USD, "USD")}</td>
              <td className="text-right whitespace-nowrap"><button className="p-2" onClick={() => showHist(u)} title="Historial" data-testid="user-history-btn"><History className="w-4 h-4" /></button>
                <button className="p-2" onClick={() => setEdit({ ...u, password: "" })} data-testid="user-edit-btn"><Pencil className="w-4 h-4" /></button>
                {u.id !== me.id && <button className="p-2 text-red-600" data-testid="user-delete-btn" onClick={async () => { if (window.confirm("¿Eliminar usuario?")) { await api.delete(`/admin/users/${u.id}`); load(); } }}><Trash2 className="w-4 h-4" /></button>}</td>
            </tr>))}</tbody></table>
      </Panel>
      {hist && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => setHist(null)} data-testid="user-history-modal">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-auto space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between"><h3 className="font-bold text-lg">Historial de {hist.u.name}</h3><button onClick={() => setHist(null)}><X /></button></div>
            {!hist.orders.length && <p className="text-sm text-zinc-500">Sin compras registradas.</p>}
            {hist.orders.map((o) => (
              <div key={o.id} className="flex justify-between items-center border-b pb-2 text-sm"><div><b>#{o.number}</b> · {new Date(o.created_at).toLocaleDateString("es-AR")}<p className="text-xs text-zinc-500">{o.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}</p></div>
                <div className="text-right"><b>{fmt(o.total, o.currency)}</b><div><StatusBadge s={o.status} /></div></div></div>))}
          </div>
        </div>
      )}
    </div>
  );
}
