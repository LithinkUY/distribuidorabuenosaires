import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  FileDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Car,
  CreditCard,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

export const AnalyticsReportsSection: React.FC = () => {
  const {
    orders,
    products,
    updateStock,
    monthlyStats,
    exportMonthlyReportPDF,
    exportComprehensiveExcelReport,
    exportOrdersToExcel,
  } = useStore();

  const [currencyMode, setCurrencyMode] = useState<'USD' | 'ARS' | 'DUAL'>('ARS');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'12m' | '6m' | '3m'>('12m');

  // Filter months based on timeframe
  const displayedStats =
    selectedTimeframe === '3m'
      ? monthlyStats.slice(-3)
      : selectedTimeframe === '6m'
      ? monthlyStats.slice(-6)
      : monthlyStats;

  // Real-time metrics
  const activeOrders = orders.filter((o) => o.status !== 'Cancelado');
  const totalRevenueUSD = activeOrders.reduce((sum, o) => sum + o.totalUSD, 0);
  const totalRevenueARS = activeOrders.reduce((sum, o) => sum + o.totalARS, 0);
  const totalUnitsInStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryValueUSD = products.reduce((sum, p) => sum + p.stock * p.priceUSD, 0);
  const totalInventoryValueARS = totalInventoryValueUSD * 1250;

  // Stock categories
  const criticalStock = products.filter((p) => p.stock <= 5);
  const lowStock = products.filter((p) => p.stock > 5 && p.stock <= 15);
  const healthyStock = products.filter((p) => p.stock > 15);

  // Sales by Category calculation
  const categorySalesMap: Record<string, { count: number; totalUSD: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const cat = prod?.category || 'Otros';
      if (!categorySalesMap[cat]) categorySalesMap[cat] = { count: 0, totalUSD: 0 };
      categorySalesMap[cat].count += item.quantity;
      categorySalesMap[cat].totalUSD += item.price * item.quantity;
    });
  });

  const maxUSDInStats = Math.max(...displayedStats.map((s) => s.salesUSD));

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Controls: Currency & Timeframe Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-xl text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span>Centro de Inteligencia de Ventas & Reportes</span>
          </h2>
          <p className="text-xs text-slate-600">
            Estadísticas en tiempo real, trazabilidad de stock y exportación contable en PDF y Excel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-xs font-semibold">
            {(['12m', '6m', '3m'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedTimeframe === t ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === '12m' ? '12 Meses' : t === '6m' ? '6 Meses' : '3 Meses'}
              </button>
            ))}
          </div>

          {/* Currency Toggle */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-xs font-semibold">
            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currencyMode === 'USD' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dólares (USD)
            </button>
            <button
              onClick={() => setCurrencyMode('ARS')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currencyMode === 'ARS' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pesos (ARS)
            </button>
            <button
              onClick={() => setCurrencyMode('DUAL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currencyMode === 'DUAL' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dual USD/ARS
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Facturado */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-2">
            <span>Facturación Neta Total</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>

          {currencyMode === 'USD' && (
            <div className="font-mono font-extrabold text-2xl text-slate-900 tabular-nums mb-1">
              US$ {totalRevenueUSD.toLocaleString()}
            </div>
          )}
          {currencyMode === 'ARS' && (
            <div className="font-mono font-extrabold text-2xl text-slate-900 tabular-nums mb-1">
              $ {totalRevenueARS.toLocaleString()} ARS
            </div>
          )}
          {currencyMode === 'DUAL' && (
            <div>
              <div className="font-mono font-extrabold text-2xl text-slate-900 tabular-nums">
                US$ {totalRevenueUSD.toLocaleString()}
              </div>
              <div className="font-mono text-xs text-blue-600 tabular-nums">
                ≈ $ {totalRevenueARS.toLocaleString()} ARS
              </div>
            </div>
          )}

          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+22.6% tasa de crecimiento anual</span>
          </div>
        </div>

        {/* Valuación de Stock */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-2">
            <span>Valuación de Stock Físico</span>
            <Package className="w-4 h-4 text-sky-400" />
          </div>

          {currencyMode === 'USD' && (
            <div className="font-mono font-extrabold text-2xl text-slate-900 tabular-nums mb-1">
              US$ {totalInventoryValueUSD.toLocaleString()}
            </div>
          )}
          {currencyMode === 'ARS' && (
            <div className="font-mono font-extrabold text-2xl text-slate-900 tabular-nums mb-1">
              $ {totalInventoryValueARS.toLocaleString()} ARS
            </div>
          )}
          {currencyMode === 'DUAL' && (
            <div>
              <div className="font-mono font-extrabold text-2xl text-slate-900 tabular-nums">
                US$ {totalInventoryValueUSD.toLocaleString()}
              </div>
              <div className="font-mono text-xs text-slate-600 tabular-nums">
                ≈ $ {totalInventoryValueARS.toLocaleString()} ARS
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-600 mt-2">
            {totalUnitsInStock} artículos terminados en depósito
          </div>
        </div>

        {/* Pedidos & Ticket Promedio */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-2">
            <span>Ticket Promedio por Orden</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>

          <div className="font-mono font-extrabold text-2xl text-slate-900 tabular-nums mb-1">
            {currencyMode === 'ARS'
              ? `$ ${Math.round(totalRevenueARS / (orders.length || 1)).toLocaleString()} ARS`
              : `US$ ${Math.round(totalRevenueUSD / (orders.length || 1))}`}
          </div>

          <div className="text-[11px] text-slate-600">
            {orders.length} pedidos procesados en el sistema
          </div>
        </div>

        {/* Estado Crítico de Stock */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between text-slate-600 text-xs mb-2">
            <span>Control de Stock</span>
            {criticalStock.length > 0 ? (
              <AlertTriangle className="w-4 h-4 text-blue-500 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>

          <div className="font-mono font-extrabold text-2xl text-slate-900 tabular-nums mb-1">
            {criticalStock.length} <span className="text-xs font-normal text-blue-600">críticos</span>
          </div>

          <div className="text-[11px] text-slate-600">
            {lowStock.length} productos con stock bajo (6 a 15 u.)
          </div>
        </div>

      </div>

      {/* Visual Chart: Monthly Revenue Comparison (in USD and ARS) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Curva de Ventas Mensuales ({currencyMode === 'DUAL' ? 'Dual USD y ARS' : currencyMode})
            </h3>
            <p className="text-xs text-slate-600">
              Desglose mes a mes con volumen de pedidos y facturación neta
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              <span>Ventas USD</span>
            </span>
            {(currencyMode === 'ARS' || currencyMode === 'DUAL') && (
              <span className="flex items-center gap-1.5 ml-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span>Ventas ARS</span>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Responsive Bar Graph with Dual Tooltips */}
        <div className="space-y-4">
          {displayedStats.map((stat) => {
            const pct = Math.min(100, Math.round((stat.salesUSD / maxUSDInStats) * 100));

            return (
              <div key={stat.month} className="group relative">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 font-medium w-28 truncate">{stat.month}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {stat.ordersCount} compras
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono font-bold text-xs tabular-nums">
                    {(currencyMode === 'USD' || currencyMode === 'DUAL') && (
                      <span className="text-slate-900">US$ {stat.salesUSD.toLocaleString()}</span>
                    )}
                    {(currencyMode === 'ARS' || currencyMode === 'DUAL') && (
                      <span className="text-amber-400">
                        $ {stat.salesARS.toLocaleString()} ARS
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar representation */}
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-blue-700 via-blue-600 to-amber-500 rounded-full transition-all duration-700 group-hover:brightness-125"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stock Level Tracking Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              <span>Monitoreo de Niveles de Stock en Tiempo Real</span>
            </h3>
            <p className="text-xs text-slate-600">
              Ajuste rápido de inventario físico y alertas automáticas de reposición
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-blue-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>≤ 5 Crítico</span>
            </span>
            <span className="text-amber-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>6-15 Bajo</span>
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>&gt; 15 Óptimo</span>
            </span>
          </div>
        </div>

        {/* Stock Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/60 uppercase tracking-wider text-[10px] text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Artículo & SKU</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Precio USD</th>
                <th className="py-2.5 px-3">Precio ARS</th>
                <th className="py-2.5 px-3">Stock Físico</th>
                <th className="py-2.5 px-3">Valuación USD</th>
                <th className="py-2.5 px-3 text-right">Ajuste Rápido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {products.map((p) => {
                const isCrit = p.stock <= 5;
                const isLow = p.stock > 5 && p.stock <= 15;

                return (
                  <tr key={p.id} className="hover:bg-slate-100/40 transition-colors font-sans">
                    <td className="py-3 px-3 flex items-center gap-2.5">
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <strong className="text-slate-900 block truncate text-xs">{p.name}</strong>
                        <span className="text-[10px] font-mono text-slate-500">SKU: {p.sku}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600 text-xs">{p.category}</td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-900 tabular-nums">
                      US$ {p.priceUSD}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700 tabular-nums">
                      $ {p.priceARS.toLocaleString()} ARS
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          isCrit
                            ? 'bg-blue-50/60 border border-blue-500 text-blue-600'
                            : isLow
                            ? 'bg-amber-950/60 border border-amber-500 text-amber-400'
                            : 'bg-emerald-950/40 border border-emerald-500 text-emerald-400'
                        }`}
                      >
                        {p.stock} unid.
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-900 tabular-nums">
                      US$ {(p.stock * p.priceUSD).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                        <button
                          onClick={() => updateStock(p.id, Math.max(0, p.stock - 1))}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded"
                          title="Descontar 1 unidad"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-slate-900">
                          {p.stock}
                        </span>
                        <button
                          onClick={() => updateStock(p.id, p.stock + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded"
                          title="Sumar 1 unidad"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Export Center */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="font-display font-bold text-base text-slate-900 flex items-center gap-2 mb-1">
            <FileDown className="w-5 h-5 text-blue-500" />
            <span>Centro de Exportación de Reportes Contables & Auditoría</span>
          </h4>
          <p className="text-xs text-slate-600 max-w-xl">
            Generá informes completos para contabilidad, directorio o inventario en formato PDF formal con membrete o planillas Excel estructuradas con fórmulas y UTF-8.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={exportOrdersToExcel}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Exportar Pedidos (.CSV)</span>
          </button>

          <button
            onClick={exportComprehensiveExcelReport}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-transform active:scale-95"
          >
            <FileDown className="w-4 h-4" />
            <span>Informe Integral Excel (Ventas + Stock)</span>
          </button>

          <button
            onClick={exportMonthlyReportPDF}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-50/40 transition-transform active:scale-95"
          >
            <FileDown className="w-4 h-4" />
            <span>Descargar Reporte PDF Oficial</span>
          </button>
        </div>
      </div>

    </div>
  );
};
