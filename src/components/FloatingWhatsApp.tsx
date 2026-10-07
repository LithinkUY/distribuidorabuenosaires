import React, { useState } from 'react';
import { MessageCircle, X, Send, Car, PackageCheck, HelpCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { storeSettings } = useStore();

  const handleSendPrompt = (text: string) => {
    const rawNumber = (storeSettings?.whatsappNumber || '5491112345678').replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${rawNumber}?text=${encoded}`, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Popover Window */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl animate-fade-in text-slate-900 text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-xs text-slate-900">Distribuidora Buenos Aires</strong>
                <span className="text-[10px] text-emerald-600 font-medium">En línea · Asesoría y Ventas</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-600 hover:text-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-700 text-[11px] leading-relaxed">
            ¡Hola! ¿En qué podemos asesorarte hoy? Elegí una opción para abrir WhatsApp directamente:
          </p>

          <div className="space-y-1.5">
            <button
              onClick={() => handleSendPrompt('¡Hola! Me gustaría consultar por stock y disponibilidad de cubreasientos para mi vehículo.')}
              className="w-full p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-left flex items-center gap-2 transition-colors text-slate-800"
            >
              <Car className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Consultar cubreasientos en stock</span>
            </button>

            <button
              onClick={() => handleSendPrompt('¡Hola! Quisiera consultar sobre alfombras termoformadas 3D / 5D.')}
              className="w-full p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-left flex items-center gap-2 transition-colors text-slate-800"
            >
              <PackageCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Consultar por alfombras 3D bandeja</span>
            </button>

            <button
              onClick={() => handleSendPrompt('¡Hola! Deseo consultar el estado de fabricación o despacho de mi pedido.')}
              className="w-full p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-left flex items-center gap-2 transition-colors text-slate-800"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Consultar estado de mi pedido</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button matching screenshot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-xl shadow-emerald-950/40 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 relative group focus:outline-none"
        aria-label="Atención por WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white animate-pulse" />
        <MessageCircle className="w-7 h-7 fill-white" />
      </button>
    </div>
  );
};
