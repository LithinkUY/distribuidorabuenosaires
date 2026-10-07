import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Building2, Check, Send, PhoneCall, Truck, Percent } from 'lucide-react';

export const WholesaleModal: React.FC = () => {
  const { isWholesaleOpen, setIsWholesaleOpen, storeSettings } = useStore();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('+54 9 11 ');
  const [city, setCity] = useState('');
  const [businessType, setBusinessType] = useState('Concesionaria');
  const [estimatedMonthlyUnits, setEstimatedMonthlyUnits] = useState('10 - 25 unidades');
  const [notes, setNotes] = useState('');

  if (!isWholesaleOpen) return null;

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const rawNumber = (storeSettings?.whatsappNumber || '5491112345678').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `¡Hola Distribuidora Buenos Aires! 👋 Solicito lista de precios mayoristas y condiciones para distribuidores:\n` +
      `• Empresa / Razón Social: ${companyName}\n` +
      `• Contacto: ${contactName}\n` +
      `• Tipo de Negocio: ${businessType}\n` +
      `• Ciudad / Región: ${city}\n` +
      `• Volumen Estimado: ${estimatedMonthlyUnits}\n` +
      `• Comentarios: ${notes || 'Solicitud de catálogo mayorista.'}`
    );
    window.open(`https://wa.me/${rawNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
    setIsWholesaleOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900">
                Venta Mayorista & Concesionarias Oficiales
              </h2>
              <span className="text-[11px] text-slate-600">
                Precios especiales por lote para flotas, casas de repuestos y tapicerías
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsWholesaleOpen(false)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits bar */}
        <div className="p-6 border-b border-slate-200/80 bg-slate-100/40 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <Percent className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Hasta 35% de margen comercial</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <Truck className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Despacho prioritario semanal</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Exclusividad de zona disponible</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSendQuote} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Nombre de la Empresa / Taller *</label>
              <input
                type="text"
                required
                placeholder="ej. AutoSport Motors S.A."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Persona de Contacto *</label>
              <input
                type="text"
                required
                placeholder="ej. Matías Silva (Gerente Comercial)"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">WhatsApp / Teléfono Directo *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Ciudad y País *</label>
              <input
                type="text"
                required
                placeholder="Montevideo, Salto, Maldonado, Rosario..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Rubro de la Empresa</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="Concesionaria Oficial">Concesionaria Oficial</option>
                <option value="Agencia de Usados">Agencia de Usados</option>
                <option value="Casa de Repuestos y Accesorios">Casa de Repuestos y Accesorios</option>
                <option value="Empresa de Flotas / Rent a Car">Empresa de Flotas / Rent a Car</option>
                <option value="Tapicería Automotriz">Tapicería Automotriz</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Volumen Estimado Mensual</label>
              <select
                value={estimatedMonthlyUnits}
                onChange={(e) => setEstimatedMonthlyUnits(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="5 - 15 juegos">5 - 15 juegos / mes</option>
                <option value="15 - 30 juegos">15 - 30 juegos / mes</option>
                <option value="30 - 60 juegos">30 - 60 juegos / mes</option>
                <option value="+60 juegos (Gran distribuidor)">+60 juegos (Gran distribuidor)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-600 mb-1">Mensaje o requerimiento especial</label>
            <textarea
              rows={2}
              placeholder="¿Precisas muestras de materiales, catálogo físico o lista de precios mayoristas?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsWholesaleOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-slate-900 font-bold text-xs rounded-xl shadow-lg shadow-blue-50/40 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Solicitar Catálogo Mayorista por WhatsApp</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
