import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { resolveMediaUrl } from '../utils/mediaStorage';

interface HeroProps {
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  const { storeSettings } = useStore();
  const slides = storeSettings?.heroSlides?.length ? storeSettings.heroSlides : [];
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const slide = slides[currentSlideIndex] || {
    mediaUrl: '/src/assets/images/hero_car_interior_dark_red_1791205466989.jpg',
    type: 'image',
    title: storeSettings?.homeHeroTitle || 'BIENVENIDO',
    subtitle: storeSettings?.homeHeroSubtitle || 'El mejor catálogo.',
    buttonText: 'Ver Catálogo',
  };

  const [resolvedUrl, setResolvedUrl] = useState<string>(slide.mediaUrl);

  useEffect(() => {
    let isCurrent = true;
    resolveMediaUrl(slide.mediaUrl).then((url) => {
      if (isCurrent) {
        setResolvedUrl(url || slide.mediaUrl);
      }
    });
    return () => {
      isCurrent = false;
    };
  }, [slide.mediaUrl]);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {slide.type === 'video' && resolvedUrl && !resolvedUrl.startsWith('idb:') ? (
          <video
            key={resolvedUrl}
            src={resolvedUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center filter brightness-[0.9] contrast-[1.1]"
          />
        ) : (
          <img
            key={resolvedUrl || 'default-hero'}
            src={resolvedUrl && !resolvedUrl.startsWith('idb:') ? resolvedUrl : '/src/assets/images/hero_car_interior_dark_red_1791205466989.jpg'}
            alt="Hero Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.9] contrast-[1.1] animate-fade-in"
          />
        )}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        
        <div className="backdrop-blur-md bg-white/70 border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-2xl w-full mb-10 transition-all hover:border-blue-500/30">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 tracking-tight leading-tight uppercase drop-shadow-md text-balance mb-4">
            {slide.title}
          </h1>

          <p className="text-slate-700 text-sm sm:text-base font-medium max-w-md mx-auto mb-6">
            {slide.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onExplore}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-100/40 transition-transform active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: storeSettings?.primaryColor }}
            >
              <span>{slide.buttonText || 'Ver Catálogo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="flex gap-2 mb-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlideIndex(i)}
                className={"w-3 h-3 rounded-full transition-colors " + (i === currentSlideIndex ? 'bg-blue-600' : 'bg-slate-300')}
              />
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-1 animate-bounce" style={{ color: storeSettings?.primaryColor || '#0055ff' }}>
          <span className="text-[11px] uppercase tracking-widest font-bold">Deslizá hacia abajo</span>
          <ChevronDown className="w-6 h-6 stroke-[3]" />
        </div>
      </div>
    </section>
  );
};
