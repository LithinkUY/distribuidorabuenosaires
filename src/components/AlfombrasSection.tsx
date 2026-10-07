import React, { useState, useEffect } from 'react';
import { useStore, DEFAULT_ALFOMBRAS_SECTION } from '../context/StoreContext';
import { ShieldCheck, Droplets, Layers, ArrowRight, ShoppingBag } from 'lucide-react';
import { resolveMediaUrl } from '../utils/mediaStorage';

export const AlfombrasSection: React.FC = () => {
  const {
    products,
    setSelectedProductForDetail,
    addToCart,
    formatPrice,
    storeSettings,
    setSelectedCategory,
  } = useStore();

  const cfg = storeSettings?.alfombrasSection || DEFAULT_ALFOMBRAS_SECTION;
  const sectionConfig = storeSettings?.homeSections?.find(s => s.id === 'alfombras');
  if (sectionConfig && !sectionConfig.visible) return null;

  // Linked product for cart or detail
  const matsProduct = products.find(p => p.id === cfg.secondaryButtonProductId) ||
    products.find(p => p.category.toLowerCase().includes('alfombra')) ||
    products[0];

  const [resolvedUrl, setResolvedUrl] = useState<string>(cfg.mediaUrl);

  useEffect(() => {
    let isCurrent = true;
    resolveMediaUrl(cfg.mediaUrl).then((url) => {
      if (isCurrent) setResolvedUrl(url || cfg.mediaUrl);
    });
    return () => { isCurrent = false; };
  }, [cfg.mediaUrl]);

  const handlePrimaryClick = () => {
    if (cfg.primaryButtonAction === 'catalogo') {
      window.location.href = '/catalogo';
    } else if (cfg.primaryButtonAction === 'productos') {
      setSelectedCategory('Alfombras');
      const el = document.getElementById('productos');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (cfg.primaryButtonAction === 'whatsapp') {
      const rawNumber = (storeSettings?.whatsappNumber || '5491112345678').replace(/[^0-9]/g, '');
      const text = encodeURIComponent('¡Hola! Me gustaría consultar por los modelos de alfombras termoformadas 3D/5D disponibles.');
      window.open(`https://wa.me/${rawNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
    } else if (cfg.primaryButtonAction === 'url' && cfg.primaryButtonUrl) {
      window.open(cfg.primaryButtonUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = '/catalogo';
    }
  };

  const handleSecondaryClick = () => {
    if (cfg.secondaryButtonAction === 'addToCart') {
      if (matsProduct) {
        addToCart(matsProduct, 1);
      }
    } else if (cfg.secondaryButtonAction === 'catalogo') {
      window.location.href = '/catalogo';
    } else if (cfg.secondaryButtonAction === 'whatsapp') {
      const rawNumber = (storeSettings?.whatsappNumber || '5491112345678').replace(/[^0-9]/g, '');
      const text = encodeURIComponent(`¡Hola! Quisiera comprar el set de alfombras termoformadas (${matsProduct ? matsProduct.name : '3D/5D'}).`);
      window.open(`https://wa.me/${rawNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
    } else if (cfg.secondaryButtonAction === 'url' && cfg.secondaryButtonUrl) {
      window.open(cfg.secondaryButtonUrl, '_blank', 'noopener,noreferrer');
    } else {
      if (matsProduct) {
        addToCart(matsProduct, 1);
      }
    }
  };

  return (
    <section id="alfombras" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Asset (Image or Video) */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl group bg-slate-900">
              {cfg.mediaType === 'video' ? (
                <video
                  key={resolvedUrl}
                  src={resolvedUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <img
                  key={resolvedUrl}
                  src={resolvedUrl}
                  alt={cfg.cardTitle || 'Alfombras termoformadas'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  {cfg.cardSubtitle && (
                    <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-semibold block mb-1">
                      {cfg.cardSubtitle}
                    </span>
                  )}
                  {cfg.cardTitle && (
                    <h3 className="font-display font-bold text-xl text-white">
                      {cfg.cardTitle}
                    </h3>
                  )}
                </div>
                {cfg.cardPriceTag && (
                  <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono font-bold text-white shadow-lg">
                    {cfg.cardPriceTag}
                  </div>
                )}
              </div>
            </div>

            {/* Accent decorative badge */}
            {cfg.cardBadge && (
              <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold">
                <Droplets className="w-4 h-4" />
                <span>{cfg.cardBadge}</span>
              </div>
            )}
          </div>

          {/* Right Column: Technical Excellence */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {cfg.badge && (
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-500 mb-3">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{cfg.badge}</span>
                </div>
              )}
              
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 leading-tight">
                {cfg.title}
              </h2>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed">
              {cfg.description}
            </p>

            {/* Feature Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-100/60 border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-2">
                  <Droplets className="w-4 h-4" />
                </div>
                <strong className="text-xs font-bold text-slate-900 block mb-1">
                  {cfg.feature1Title}
                </strong>
                <span className="text-[11px] text-slate-600">
                  {cfg.feature1Description}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-100/60 border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <strong className="text-xs font-bold text-slate-900 block mb-1">
                  {cfg.feature2Title}
                </strong>
                <span className="text-[11px] text-slate-600">
                  {cfg.feature2Description}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              {cfg.primaryButtonText && (
                <button
                  onClick={handlePrimaryClick}
                  className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-50/40 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>{cfg.primaryButtonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {cfg.secondaryButtonText && (
                <button
                  onClick={handleSecondaryClick}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-600" />
                  <span>{cfg.secondaryButtonText}</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
