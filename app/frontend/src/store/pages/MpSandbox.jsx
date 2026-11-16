import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";
import { api, fmt, errMsg } from "@/lib/api";

export default function MpSandbox() {
  const { id } = useParams();
  const nav = useNavigate();
  const [o, setO] = useState(null);
  const [card, setCard] = useState({ number: "5031 7557 3453 0604", name: "APRO", exp: "11/30", cvv: "123" });
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get(`/orders/${id}`).then((r) => setO(r.data)); }, [id]);

  const pay = async (result) => {
    setBusy(true);
    try {
      await api.post(`/payments/mp/simulate/${id}`, { result });
      toast[result === "approved" ? "success" : "error"](result === "approved" ? "Pago aprobado" : "Pago rechazado");
      nav(`/orden/${id}`);
    } catch (e) { toast.error(errMsg(e)); setBusy(false); }
  };
  if (!o) return <div className="py-32 text-center">Cargando…</div>;
  const f = (k, label) => <label className="block text-xs font-semibold text-zinc-600">{label}
    <input data-testid={`mp-${k}`} value={card[k]} onChange={(e) => setCard({ ...card, [k]: e.target.value })} className="w-full mt-1 border border-zinc-300 rounded-md px-3 py-2.5 text-sm text-zinc-900" /></label>;

  return (
    <div className="min-h-[70vh] bg-[#EDEDED] py-14 px-4" data-testid="mp-sandbox-page">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden text-zinc-900" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="bg-[#009EE3] text-white px-6 py-4 flex items-center justify-between">
          <b>Mercado Pago</b><span className="text-[11px] bg-white/20 px-2 py-0.5 rounded">SANDBOX · SIMULACIÓN</span>
        </div>
        <div className="p-6 space-y-5">
          <div><p className="text-sm text-zinc-500">Pedido #{o.number}</p><p className="text-3xl font-bold" data-testid="mp-amount">{fmt(o.total, o.currency)}</p></div>
          <div className="flex items-center gap-2 text-sm font-semibold"><CreditCard className="w-4 h-4" />Tarjeta de crédito o débito</div>
          {f("number", "Número de tarjeta")}
          {f("name", "Nombre del titular (APRO = aprobado, OTHE = rechazado)")}
          <div className="grid grid-cols-2 gap-3">{f("exp", "Vencimiento")}{f("cvv", "CVV")}</div>
          <button data-testid="mp-pay-btn" disabled={busy} onClick={() => pay(card.name.trim().toUpperCase() === "OTHE" ? "rejected" : "approved")} className="w-full bg-[#009EE3] text-white font-semibold py-3 rounded-md hover:bg-[#0088c5] disabled:opacity-50">Pagar</button>
          <button data-testid="mp-reject-btn" disabled={busy} onClick={() => pay("rejected")} className="w-full text-sm text-zinc-500 underline">Simular pago rechazado</button>
          <p className="text-[11px] text-zinc-400 flex items-center gap-1 justify-center"><Lock className="w-3 h-3" />Entorno de simulación: no se realizan cobros reales.</p>
        </div>
      </div>
    </div>
  );
}
