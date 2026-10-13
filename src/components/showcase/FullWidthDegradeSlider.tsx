import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

export interface FullWidthSlide {
  id: string;
  title: string;
  subtitle: string;
  bgImage: string;
  buttonText: string;
  buttonAction: 'catalogo' | 'whatsapp' | 'url' | 'producto';
  buttonTarget?: string;
}

interface FullWidthDegradeSliderProps {
  slides?: FullWidthSlide[];
  onOpenCatalog?: () => void;
}

export const DEFAULT_FULLWIDTH_SLIDES: FullWidthSlide[] = [
  {
    id: 'fws-1',
    title: 'FUNDAS PARA AUTOS\nA MEDIDA EN\nARGENTINA',
    subtitle: 'Fundas para autos premium, hechas a medida para tu vehículo. Protegé tus butacas con materiales de alta calidad y envío a todo el país.',
    bgImage: '/wix/hero_full_seats_bg.jpg',
    buttonText: 'COMPRAR AHORA ↗',
    buttonAction: 'catalogo',
  },
];

export const FullWidthDegradeSlider: React.FC<FullWidthDegradeSliderProps> = ({
  slides = DEFAULT_FULLWIDTH_SLIDES,
  onOpenCatalog,
}) => {
  const { setSelectedProductForDetail, products, storeSettings } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeSlides = slides && slides.length > 0 ? slides : DEFAULT_FULLWIDTH_SLIDES;
  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  // Auto rotate if more than 1 slide
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleButtonClick = () => {
    if (currentSlide.buttonAction === 'producto' && currentSlide.buttonTarget) {
      const prod = products.find((p) => p.id === currentSlide.buttonTarget);
      if (prod) {
        setSelectedProductForDetail(prod);
        return;
      }
    }
    if (currentSlide.buttonAction === 'whatsapp') {
      const rawNumber = (storeSettings?.whatsappNumber || '5491138475288').replace(/[^0-9]/g, '');
      const textEncoded = encodeURIComponent('¡Hola! Me comunico desde la web para consultar por fundas a medida.');
      window.open(`https://wa.me/${rawNumber}?text=${textEncoded}`, '_blank');
      return;
    }
    if (currentSlide.buttonAction === 'url' && currentSlide.buttonTarget) {
      window.open(currentSlide.buttonTarget, '_blank');
      return;
    }
    // Default: Open catalog or scroll to catalog
    if (onOpenCatalog) {
      onOpenCatalog();
    } else {
      window.location.href = '/catalogo';
    }
  };

  return (
    <section id="banner-degrade-fullwidth" className="relative w-full min-h-[500px] sm:min-h-[560px] md:min-h-[640px] bg-black text-white overflow-hidden flex items-center border-b border-zinc-900">
      
      {/* Background Image with Transition */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentSlide.bgImage}
          alt={currentSlide.title}
          className="w-full h-full object-cover object-center transition-opacity duration-700"
        />
        
        {/* Degrade / Gradient matching user screenshot 2:
            heavy dark gradient on the left, subtle fade at top and bottom */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Slide Navigation Arrows if > 1 slide */}
      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-black border border-zinc-700 text-white flex items-center justify-center transition-all"
            aria-label="Anterior slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-black border border-zinc-700 text-white flex items-center justify-center transition-all"
            aria-label="Siguiente slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Content Container matching screenshot typography */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="max-w-2xl space-y-6">
          
          {/* Huge bold uppercase title with line breaks */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-[1.05] drop-shadow-xl font-display whitespace-pre-line">
            {currentSlide.title}
          </h1>

          {/* Subtitle / Description text */}
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl drop-shadow-md">
            {currentSlide.subtitle}
          </p>

          {/* Red button "COMPRAR AHORA ↗" matching screenshot */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleButtonClick}
              className="py-3 px-6 sm:py-3.5 sm:px-7 bg-[#e52525] hover:bg-[#c91d1d] active:scale-[0.98] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded transition-all duration-200 inline-flex items-center gap-2 shadow-2xl shadow-red-950/50"
            >
              <span>{currentSlide.buttonText || 'COMPRAR AHORA ↗'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Slide Indicator Dots if > 1 slide */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex ? 'w-8 bg-red-600' : 'w-2 bg-zinc-600 hover:bg-zinc-400'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

    </section>
  );
};
