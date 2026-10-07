import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Droplets, Sparkles, Layers, ArrowRight } from 'lucide-react';

export const AlfombrasSection: React.FC = () => {
  const { products, setSelectedProductForDetail, addToCart, formatPrice, storeSettings
  } = useStore();

  // Find the 3D mats product
  const matsProduct = products.find((p) => p.category === 'Alfombras 3D y 5D') || products[1];

  const sectionConfig = storeSettings?.homeSections?.find(s => s.id === 'alfombras');
  if (sectionConfig && !sectionConfig.visible) return null;

  return (
    <section id="alfombras" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Asset */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl group">
              <img
                src={matsProduct.image}
                alt="Alfombras 3D termoformadas bandeja profunda con textura de carbono"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-blue-500 font-semibold block mb-1">
                    Escaneo Láser 3D
                  </span>
                  <h3 className="font-display font-bold text-xl text-slate-900">
                    Bandejas Termoformadas 5D de Borde Alto
                  </h3>
                </div>
                <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900">
                  {formatPrice(matsProduct.priceUSD)}
                </div>
              </div>
            </div>

            {/* Accent decorative badge */}
            <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold">
              <Droplets className="w-4 h-4" />
              <span>100% Antiderrame</span>
            </div>
          </div>

          {/* Right Column: Technical Excellence */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-500 mb-3">
                <Layers className="w-3.5 h-3.5" />
                <span>Protección Extrema para el Piso de tu Vehículo</span>
              </div>
              
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 leading-tight">
                Alfombras Termoformadas 3D & 5D de Alta Cobertura
              </h2>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed">
              Desarrolladas con polímeros TPE de alta densidad termo-moldeados con precisión digital. A diferencia de las alfombras universales planas que se doblan y dejan pasar la mugre, nuestras bandejas de borde perimetral elevado de 5 cm retienen agua, barro, nieve y café, manteniendo la alfombra original impecable como el primer día.
            </p>

            {/* Feature Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-100/60 border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-2">
                  <Droplets className="w-4 h-4" />
                </div>
                <strong className="text-xs font-bold text-slate-900 block mb-1">
                  Retención Antiderrame
                </strong>
                <span className="text-[11px] text-slate-600">
                  Paredes de 5 cm de altura que encapsulan suciedad y líquidos sin filtraciones.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-100/60 border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <strong className="text-xs font-bold text-slate-900 block mb-1">
                  Anclaje de Seguridad OEM
                </strong>
                <span className="text-[11px] text-slate-600">
                  Fijación a las trabas originales del piso del auto, evitando cualquier deslizamiento hacia los pedales.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setSelectedProductForDetail(matsProduct)}
                className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-50/40 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Ver Modelos Disponibles</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => addToCart(matsProduct, 1)}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-xs rounded-xl transition-colors"
              >
                Comprar Set de Alfombras ({formatPrice(matsProduct.priceUSD)})
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
