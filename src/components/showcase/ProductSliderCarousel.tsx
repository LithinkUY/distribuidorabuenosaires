import React, { useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface ProductSliderCarouselProps {
  title?: string;
  subtitle?: string;
  productIds?: string[];
  buttonText?: string;
}

export const ProductSliderCarousel: React.FC<ProductSliderCarouselProps> = ({
  title,
  subtitle,
  productIds,
  buttonText = '+ comprar',
}) => {
  const { products, setSelectedProductForDetail, addToCart, formatPrice } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter or sort products
  let displayProducts = [...products];
  if (productIds && productIds.length > 0) {
    const map = new Map(products.map((p) => [p.id, p]));
    const selected = productIds.map((id) => map.get(id)).filter(Boolean) as Product[];
    if (selected.length > 0) displayProducts = selected;
  } else {
    // Put Wix products first
    displayProducts.sort((a, b) => {
      const aIsWix = a.id.startsWith('wix-') ? 1 : 0;
      const bIsWix = b.id.startsWith('wix-') ? 1 : 0;
      return bIsWix - aIsWix;
    });
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleCardClick = (p: Product) => {
    setSelectedProductForDetail(p);
  };

  const handleBuyClick = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    if (p.variants && p.variants.length > 0) {
      setSelectedProductForDetail(p);
    } else {
      addToCart(p, 1);
    }
  };

  if (displayProducts.length === 0) return null;

  return (
    <section id="carrusel-productos" className="bg-black text-white py-10 sm:py-14 border-b border-zinc-900 relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header if title exists */}
        {(title || subtitle) && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              {title && (
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white font-display">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Carousel Container with Left/Right Arrows matching screenshot */}
        <div className="relative group">
          
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/85 hover:bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center transition-all duration-200 shadow-xl opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/85 hover:bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center transition-all duration-200 shadow-xl opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Horizontal Scroll Track */}
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto scroll-smooth scrollbar-none py-3 px-1"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {displayProducts.map((product) => {
              const displayImg = product.image || (product.images && product.images[0]) || '/placeholder.png';
              return (
                <div
                  key={product.id}
                  onClick={() => handleCardClick(product)}
                  className="w-[210px] sm:w-[240px] md:w-[260px] shrink-0 cursor-pointer bg-black rounded-xl overflow-hidden flex flex-col justify-between group/card transition-all duration-300"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  {/* Image matching screenshot rounded rectangle */}
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-850 group-hover/card:border-zinc-700 transition-colors">
                    <img
                      src={displayImg}
                      alt={product.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover/card:scale-106"
                      loading="lazy"
                    />
                    {product.variants && product.variants.length > 0 && (
                      <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-zinc-300 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {product.variants.length} colores
                      </span>
                    )}
                  </div>

                  {/* Details below image */}
                  <div className="pt-3 pb-1 flex flex-col flex-1 justify-between space-y-2">
                    <h3 className="text-xs sm:text-[13px] font-bold uppercase tracking-tight text-white leading-tight line-clamp-2 group-hover/card:text-red-400 transition-colors">
                      {product.name}
                    </h3>

                    {/* Red Price label matching screenshot */}
                    <div className="text-xs sm:text-sm font-extrabold text-[#e52525]">
                      {formatPrice(product.priceUSD, product.priceARS)}
                    </div>

                    {/* Red Button "+ comprar" matching screenshot exactly */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={(e) => handleBuyClick(e, product)}
                        className="w-full py-2 px-3 bg-[#e52525] hover:bg-[#c91d1d] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider rounded transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-red-950/30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{buttonText}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
