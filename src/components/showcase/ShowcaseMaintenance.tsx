import React from 'react';
import { ShowcaseCard } from './showcaseConfig';
import { Sparkles, Clock } from 'lucide-react';

interface ShowcaseMaintenanceProps {
  kicker?: string;
  title?: string;
  cards: ShowcaseCard[];
}

export const ShowcaseMaintenance: React.FC<ShowcaseMaintenanceProps> = ({
  kicker = 'Mantenimiento Pro',
  title = 'Mantenimiento Pro',
  cards,
}) => {
  return (
    <section id="mantenimiento" className="bg-black text-white py-16 md:py-24 border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-red-500 font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white font-display">
            {title}
          </h2>
          <div className="w-16 h-1 bg-red-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* 3 Maintenance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-zinc-950 rounded-lg overflow-hidden border border-zinc-850 hover:border-zinc-700 transition-all duration-300 flex flex-col group"
            >
              <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{card.badge || 'Próximamente'}</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {card.text}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 px-4 bg-zinc-900 text-zinc-500 text-xs font-semibold uppercase tracking-wider rounded cursor-not-allowed border border-zinc-800"
                  >
                    Próximamente
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
