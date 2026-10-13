import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { Plus, Eye, ShoppingBag } from 'lucide-react';

interface ShowcaseModelsGridProps {
  title?: string;
  subtitle?: string;
  onSelectProduct?: (product: Product) => void;
}

export const ShowcaseModelsGrid: React.FC<ShowcaseModelsGridProps> = ({
  title = 'MODELOS CON AJUSTE PERFECTO',
  subtitle,
  onSelectProduct,
}) => {
  const { products, setSelectedProductForDetail, addToCart, formatPrice } = useStore();

  // Priority products (wix products first, then others)
  const displayProducts = [...products]
    .sort((a, b) => {
      const aIsWix = a.id.startsWith('wix-') ? 1 : 0;
      const bIsWix = b.id.startsWith('wix-') ? 1 : 0;
      return bIsWix - aIsWix;
    })
    .slice(0, 12);

  const handleCardClick = (p: Product) => {
    if (onSelectProduct) {
      onSelectProduct(p);
    } else {
      setSelectedProductForDetail(p);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    if (p.variants && p.variants.length > 0) {
      setSelectedProductForDetail(p);
    } else {
      addToCart(p, 1);
    }
  };

  return (
    <section id="modelos" className="bg-black text-white py-16 md:py-24 border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white font-display">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-sm text-zinc-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          <div className="w-16 h-1 bg-red-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Product Cards Grid matching Wix layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {displayProducts.map((product) => {
            return (
              <div
                key={product.id}
                onClick={() => handleCardClick(product)}
                className="group cursor-pointer bg-zinc-950 rounded-lg overflow-hidden border border-zinc-850 hover:border-zinc-700 transition-all duration-300 flex flex-col hover:shadow-2xl hover:shadow-red-950/20"
              >
                {/* Image Container with smooth zoom */}
                <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={product.image || (product.images && product.images[0]) || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                  {product.variants && product.variants.length > 0 && (
                    <span className="absolute top-3 right-3 bg-black/75 backdrop-blur-sm border border-zinc-700 text-zinc-200 text-[10px] font-medium px-2 py-0.5 rounded uppercase">
                      {product.variants.length} colores
                    </span>
                  )}
                </div>

                {/* Info & Buy Action */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight line-clamp-2 group-hover:text-red-400 transition-colors">
                      {product.name}
                    </h3>
                    <div className="mt-2 text-xs text-zinc-400">
                      Precio
                    </div>
                    <div className="text-lg font-extrabold text-white">
                      {formatPrice(product.priceUSD, product.priceARS)}
                    </div>
                  </div>

                  {/* +comprar button matching Wix exact label */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, product)}
                      className="w-full py-2.5 px-4 bg-transparent hover:bg-white text-white hover:text-black font-semibold text-xs tracking-wider uppercase border border-zinc-700 hover:border-white rounded transition-all duration-200 flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+comprar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
