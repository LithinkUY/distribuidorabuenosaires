import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { Download, FileText, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api, fmt, PAY_LABEL } from "@/lib/api";
import { PageHeader, Panel, Btn, Loading } from "@/admin/ui";

const COLORS = ["#18181b", "#009EE3", "#16a34a", "#f59e0b"];

const csv = (name, rows) => {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const body = [keys.join(","), ...rows.map((r) => keys.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\ufeff" + body], { type: "text/csv;charset=utf-8" }));
  a.download = `${name}.csv`;
  a.click();
};
const pdf = (title, rows) => {
  if (!rows.length) return;
  const doc = new jsPDF();
  doc.text(title, 14, 16);
  autoTable(doc, { startY: 22, head: [Object.keys(rows[0])], body: rows.map((r) => Object.values(r).map(String)), styles: { fontSize: 8 } });
  doc.save(`${title}.pdf`);
};

const Stat = ({ label, value, tid }) => (
  <div className="bg-white border border-zinc-200 rounded-xl p-5"><p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">{label}</p><p className="text-2xl font-extrabold mt-2" data-testid={tid}>{value}</p></div>
);

function SalesChart({ data, cur, color }) {
  return (
    <Panel title={`Ventas en ${cur === "ARS" ? "Pesos Argentinos (ARS)" : "Dólares (USD)"}`}>
      <div className="h-64" data-testid={`chart-${cur}`}>
        <ResponsiveContainer>
          <BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="period" fontSize={11} /><YAxis fontSize={11} width={70} tickFormatter={(v) => (cur === "ARS" ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)} />
            <Tooltip formatter={(v) => fmt(v, cur)} /><Bar dataKey={cur} fill={color} radius={[4, 4, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [period, setPeriod] = useState("month");
  useEffect(() => { api.get("/admin/analytics", { params: { period } }).then((r) => setD(r.data)); }, [period]);
  if (!d) return <Loading />;

  const reports = {
    ventas: d.all_orders.map((o) => ({ Pedido: o.number, Fecha: o.created_at.slice(0, 10), Cliente: o.customer, Estado: o.status, Moneda: o.currency, Total: o.total, Pago: PAY_LABEL[o.payment_method] })),
    metodos: d.methods.map((m) => ({ Metodo: PAY_LABEL[m.method] || m.method, Pedidos: m.count, ARS: m.ARS, USD: m.USD.toFixed(2) })),
    top: d.top_products.map((t) => ({ Producto: t.name, Unidades: t.qty, ARS: Math.round(t.ARS), USD: t.USD.toFixed(2) })),
    stock: d.low_stock.map((l) => ({ Producto: l.product, Variante: l.variant, SKU: l.sku, Stock: l.stock })),
  };
  const R = ({ k, label }) => (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0 text-sm"><span>{label}</span>
      <div className="flex gap-2"><Btn variant="outline" onClick={() => csv(k, reports[k])} data-testid={`export-csv-${k}`}><Download className="w-3.5 h-3.5" />CSV</Btn>
        <Btn variant="outline" onClick={() => pdf(label, reports[k])} data-testid={`export-pdf-${k}`}><FileText className="w-3.5 h-3.5" />PDF</Btn></div></div>
  );

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <PageHeader title="Dashboard" desc="Ventas e indicadores de la tienda (pedidos no cancelados)">
        <div className="flex bg-white border rounded-md p-0.5">{[["day", "30 días"], ["week", "12 semanas"], ["month", "6 meses"]].map(([k, l]) => (
          <button key={k} data-testid={`period-${k}`} onClick={() => setPeriod(k)} className={`px-3 py-1.5 text-xs font-semibold rounded ${period === k ? "bg-zinc-900 text-white" : ""}`}>{l}</button>))}</div>
      </PageHeader>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Facturación ARS" value={fmt(d.totals.ARS, "ARS")} tid="stat-ars" />
        <Stat label="Facturación USD" value={fmt(d.totals.USD, "USD")} tid="stat-usd" />
        <Stat label="Pedidos" value={d.totals.orders} tid="stat-orders" />
        <Stat label="Pendientes" value={d.totals.pending} tid="stat-pending" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6"><SalesChart data={d.series} cur="ARS" color="#18181b" /><SalesChart data={d.series} cur="USD" color="#16a34a" /></div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Panel title="Cantidad de pedidos por moneda" className="lg:col-span-2">
          <div className="h-56"><ResponsiveContainer><LineChart data={d.series}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="period" fontSize={11} /><YAxis fontSize={11} allowDecimals={false} /><Tooltip /><Legend />
            <Line dataKey="orders_ARS" name="Pedidos ARS" stroke="#18181b" strokeWidth={2} /><Line dataKey="orders_USD" name="Pedidos USD" stroke="#16a34a" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Métodos de pago">
          <div className="h-56"><ResponsiveContainer><PieChart><Pie data={d.methods.map((m) => ({ name: PAY_LABEL[m.method], value: m.count }))} dataKey="value" innerRadius={45} outerRadius={80}>
            {d.methods.map((m, i) => <Cell key={m.method} fill={COLORS[i % 4]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        </Panel>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Panel title="Productos más vendidos">
          {d.top_products.slice(0, 6).map((t) => <div key={t.name} className="flex justify-between text-sm py-1.5"><span className="truncate pr-2">{t.name}</span><b>{t.qty} u.</b></div>)}
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Alertas de bajo stock</span>}>
          <div className="max-h-56 overflow-auto" data-testid="low-stock-list">{d.low_stock.map((l) => <div key={l.sku} className="flex justify-between text-sm py-1.5"><span className="truncate pr-2">{l.product} <span className="text-zinc-400">{l.variant}</span></span><b className={l.stock === 0 ? "text-red-600" : "text-amber-600"}>{l.stock}</b></div>)}</div>
        </Panel>
        <Panel title="Reportes exportables"><R k="ventas" label="Ventas" /><R k="metodos" label="Métodos de pago" /><R k="top" label="Más vendidos" /><R k="stock" label="Bajo stock" /></Panel>
      </div>
      <Panel title="Últimos pedidos" actions={<Link to="/admin/pedidos" className="text-sm underline">Ver todos</Link>}>
        <table className="w-full text-sm"><tbody>{d.recent.map((o) => (
          <tr key={o.id} className="border-b border-zinc-100 last:border-0"><td className="py-2 font-semibold">#{o.number}</td><td>{o.customer.name}</td><td>{o.status}</td><td className="text-right font-semibold">{fmt(o.total, o.currency)}</td></tr>))}</tbody></table>
      </Panel>
    </div>
  );
}
