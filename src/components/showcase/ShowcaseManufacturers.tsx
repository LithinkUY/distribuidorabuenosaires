import React from 'react';
import { ShowcaseStep } from './showcaseConfig';
import { Factory, MessageCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface ShowcaseManufacturersProps {
  title: string;
  text: string;
  image: string;
  orderKicker?: string;
  orderTitle?: string;
  orderText?: string;
  steps: ShowcaseStep[];
}

export const ShowcaseManufacturers: React.FC<ShowcaseManufacturersProps> = ({
  title = 'SOMOS FABRICANTES',
  text = 'Somos fabricantes especializados en fundas a medida, con ventas por mayor y menor a todo el país.',
  image,
  orderKicker = 'Tu Pedido',
  orderTitle = 'DETALLES',
  orderText = 'Escribinos al 1138475288 hoy mismo',
  steps,
}) => {
  const { storeSettings } = useStore();
  const rawNumber = (storeSettings?.whatsappNumber || '5491138475288').replace(/[^0-9]/g, '');

  const handleWhatsAppClick = () => {
    const textEncoded = encodeURIComponent('¡Hola! Me comunico desde la web para consultar por fundas a medida.');
    window.open(`https://wa.me/${rawNumber}?text=${textEncoded}`, '_blank');
  };

  return (
    <section id="fabricantes" className="bg-black text-white py-16 md:py-24 border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Top Split: Title & Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-red-500 font-bold">
              <Factory className="w-4 h-4" />
              <span>Producción Directa</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white font-display">
              {title}
            </h2>
            
            <div className="w-16 h-1 bg-red-600 rounded-full" />

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed pt-2">
              {text}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="px-6 py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-green-950/40"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar por Mayor y Menor</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Bottom: "Tu Pedido" & Steps (Configuración, Armado, Viaje) */}
        <div className="pt-10 border-t border-zinc-900">
          <div className="text-center mb-10">
            <div className="text-xs uppercase tracking-widest text-red-500 font-bold">
              {orderKicker}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mt-1">
              {orderTitle}
            </h3>
            <p className="text-sm text-zinc-400 mt-2">
              {orderText}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div
                key={step.id || idx}
                className="bg-zinc-950 p-6 rounded-lg border border-zinc-850 hover:border-zinc-700 transition-all space-y-3 relative group"
              >
                <div className="text-3xl font-black text-red-600/40 group-hover:text-red-600 transition-colors">
                  0{idx + 1}
                </div>
                <h4 className="text-base font-bold uppercase tracking-wider text-white">
                  {step.title}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
