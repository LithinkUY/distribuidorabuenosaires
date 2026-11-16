import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, errMsg, fmt } from "@/lib/api";
import { PageHeader, Panel, Text, Select, Toggle, Btn } from "@/admin/ui";

const EMPTY = { code: "", type: "pct", value: 10, expires_at: "", max_uses: 100, active: true };

export default function Coupons() {
  const [items, setItems] = useState([]);
  const [edit, setEdit] = useState(null);
  const load = () => api.get("/admin/coupons").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!edit.code.trim() || !Number(edit.value)) return toast.error("Código y valor son obligatorios");
    try {
      const body = { ...edit, value: Number(edit.value), max_uses: Number(edit.max_uses || 0) };
      if (edit.id) await api.put(`/admin/coupons/${edit.id}`, body); else await api.post("/admin/coupons", body);
      toast.success("Cupón guardado"); setEdit(null); load();
    } catch (e) { toast.error(errMsg(e)); }
  };
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="space-y-6" data-testid="coupons-admin">
      <PageHeader title="Cupones de descuento"><Btn onClick={() => setEdit({ ...EMPTY })} data-testid="coupon-new-btn"><Plus className="w-4 h-4" />Nuevo cupón</Btn></PageHeader>
      {edit && (
        <Panel title={edit.id ? "Editar cupón" : "Nuevo cupón"}>
          <div className="grid sm:grid-cols-5 gap-3">
            <Text label="Código" value={edit.code} onChange={(v) => setEdit({ ...edit, code: v.toUpperCase() })} tid="coupon-code" />
            <Select label="Tipo" value={edit.type} onChange={(v) => setEdit({ ...edit, type: v })} tid="coupon-type" options={[{ value: "pct", label: "Porcentaje %" }, { value: "fixed", label: "Monto fijo (ARS)" }]} />
            <Text label="Valor" type="number" value={edit.value} onChange={(v) => setEdit({ ...edit, value: v })} tid="coupon-value" />
            <Text label="Vence" type="date" value={edit.expires_at} onChange={(v) => setEdit({ ...edit, expires_at: v })} tid="coupon-expires" />
            <Text label="Límite de usos (0 = ilimitado)" type="number" value={edit.max_uses} onChange={(v) => setEdit({ ...edit, max_uses: v })} tid="coupon-max-uses" />
          </div>
          <Toggle label="Activo" checked={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} tid="coupon-active" />
          <div className="flex gap-2"><Btn onClick={save} data-testid="coupon-save-btn">Guardar</Btn><Btn variant="outline" onClick={() => setEdit(null)}>Cancelar</Btn></div>
        </Panel>
      )}
      <Panel>
        <table className="w-full text-sm"><thead><tr className="text-left text-zinc-500 border-b"><th className="py-2">Código</th><th>Descuento</th><th>Vencimiento</th><th>Usos</th><th>Estado</th><th></th></tr></thead>
          <tbody>{items.map((c) => {
            const expired = c.expires_at && c.expires_at < today, full = c.max_uses && c.uses >= c.max_uses;
            return (
              <tr key={c.id} className="border-b last:border-0" data-testid={`coupon-row-${c.code}`}>
                <td className="py-3 font-mono font-bold">{c.code}</td><td>{c.type === "pct" ? `${c.value}%` : fmt(c.value, "ARS")}</td><td>{c.expires_at || "—"}</td>
                <td>{c.uses || 0} / {c.max_uses || "∞"}</td>
                <td>{!c.active ? <span className="text-zinc-400 font-bold text-xs">INACTIVO</span> : expired ? <span className="text-red-600 font-bold text-xs">VENCIDO</span> : full ? <span className="text-amber-600 font-bold text-xs">AGOTADO</span> : <span className="text-emerald-600 font-bold text-xs">ACTIVO</span>}</td>
                <td className="text-right"><button className="p-2" onClick={() => setEdit(c)} data-testid="coupon-edit-btn"><Pencil className="w-4 h-4" /></button>
                  <button className="p-2 text-red-600" data-testid="coupon-delete-btn" onClick={async () => { if (window.confirm("¿Eliminar cupón?")) { await api.delete(`/admin/coupons/${c.id}`); load(); } }}><Trash2 className="w-4 h-4" /></button></td>
              </tr>);
          })}</tbody></table>
      </Panel>
    </div>
  );
}
