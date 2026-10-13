import React from 'react';
import { Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface ShowcaseShippingProps {
  title?: string;
  text?: string;
  image: string;
  buttonText?: string;
  buttonUrl?: string;
}

export const ShowcaseShipping: React.FC<ShowcaseShippingProps> = ({
  title = 'Envíos a todo el país',
  text = 'Realizamos nuestros envíos a través de Andreani, con entrega a domicilio en todo el país y seguimiento en cada etapa del envío.',
  image,
  buttonText = 'Más info',
  buttonUrl,
}) => {
  const { storeSettings } = useStore();
  const rawNumber = (storeSettings?.whatsappNumber || '5491138475288').replace(/[^0-9]/g, '');

  const handleClick = () => {
    if (buttonUrl) {
      window.open(buttonUrl, '_blank');
    } else {
      const textEncoded = encodeURIComponent('¡Hola! Me gustaría consultar por los envíos a domicilio con Andreani.');
      window.open(`https://wa.me/${rawNumber}?text=${textEncoded}`, '_blank');
    }
  };

  return (
    <section id="envios" className="bg-black text-white py-16 md:py-20 border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-8 sm:p-12 overflow-hidden relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-red-500 font-bold">
                <Truck className="w-4 h-4" />
                <span>Logística Oficial Andreani</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white font-display">
                {title}
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                {text}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleClick}
                  className="px-6 py-3 bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider rounded transition-all inline-flex items-center gap-2"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Seguimiento online en tiempo real</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="max-w-[280px] sm:max-w-[340px] rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 p-2">
                <img
                  src={image}
                  alt="Envíos Andreani"
                  className="w-full h-auto object-contain rounded"
                  loading="lazy"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
