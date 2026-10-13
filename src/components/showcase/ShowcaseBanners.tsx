import React from 'react';
import { ShowcaseBanner } from './showcaseConfig';
import { useStore } from '../../context/StoreContext';
import { ArrowRight } from 'lucide-react';

interface ShowcaseBannersProps {
  banners: ShowcaseBanner[];
  onOpenCatalog?: () => void;
}

export const ShowcaseBanners: React.FC<ShowcaseBannersProps> = ({
  banners,
  onOpenCatalog,
}) => {
  const { setSelectedProductForDetail, products } = useStore();

  const handleBannerAction = (banner: ShowcaseBanner) => {
    if (banner.buttonAction === 'producto' && banner.buttonTarget) {
      const prod = products.find((p) => p.id === banner.buttonTarget);
      if (prod) {
        setSelectedProductForDetail(prod);
        return;
      }
    }
    if (banner.buttonAction === 'whatsapp') {
      window.open('https://wa.me/541138475288?text=Hola,%20quisiera%20consultar%20por%20sus%20productos', '_blank');
      return;
    }
    if (banner.buttonAction === 'url' && banner.buttonTarget) {
      window.open(banner.buttonTarget, '_blank');
      return;
    }
    // Default: open catalog or scroll to catalog
    if (onOpenCatalog) {
      onOpenCatalog();
    } else {
      window.location.href = '/catalogo';
    }
  };

  return (
    <div id="banners" className="bg-black text-white space-y-0">
      {banners.map((banner, index) => {
        const isImageLeft = banner.layout === 'left';
        return (
          <section
            key={banner.id || index}
            className="py-16 md:py-24 border-b border-zinc-900 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                
                {/* Image Column */}
                <div
                  className={`lg:col-span-6 ${
                    isImageLeft ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-zinc-800 shadow-2xl group bg-zinc-950">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Text Content Column */}
                <div
                  className={`lg:col-span-6 space-y-6 ${
                    isImageLeft ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white font-display">
                      {banner.title}
                    </h2>
                    <div className="w-12 h-1 bg-red-600 rounded-full" />
                  </div>

                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    {banner.text}
                  </p>

                  {banner.extraText && (
                    <p className="text-sm text-zinc-400 italic">
                      {banner.extraText}
                    </p>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleBannerAction(banner)}
                      className="px-6 py-3 bg-transparent hover:bg-white text-white hover:text-black border border-white font-semibold text-xs uppercase tracking-wider rounded transition-all duration-200 inline-flex items-center gap-2"
                    >
                      <span>{banner.buttonText || 'Comprar ahora'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};
