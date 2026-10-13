import React from 'react';
import { ShowcaseTestimonial } from './showcaseConfig';
import { Star, Quote } from 'lucide-react';

interface ShowcaseTestimonialsProps {
  title?: string;
  items: ShowcaseTestimonial[];
}

export const ShowcaseTestimonials: React.FC<ShowcaseTestimonialsProps> = ({
  title = 'Experiencias de los usuarios',
  items,
}) => {
  return (
    <section id="testimonios" className="bg-black text-white py-16 md:py-24 border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white font-display">
            {title}
          </h2>
          <div className="w-16 h-1 bg-red-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-zinc-950 p-8 rounded-lg border border-zinc-850 hover:border-zinc-700 transition-all flex flex-col justify-between relative group"
            >
              <Quote className="w-8 h-8 text-red-600/30 group-hover:text-red-600 transition-colors mb-4" />
              
              <p className="text-sm sm:text-base text-zinc-300 italic leading-relaxed mb-6">
                "{item.text}"
              </p>

              <div className="border-t border-zinc-850 pt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {item.name}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  Compra Verificada
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
