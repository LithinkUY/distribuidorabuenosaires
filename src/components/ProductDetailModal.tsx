import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Check, ShoppingBag, ShieldCheck, Truck, MessageCircle, Star, Sparkles, Play, Film, Image as ImageIcon } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductForDetail,
    setSelectedProductForDetail,
    formatPrice,
    formatProductPrice,
    addToCart,
    storeSettings,
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedStitching, setSelectedStitching] = useState('Negro con Franjas Grises / Plata');
  const [activeImage, setActiveImage] = useState<string>('');
  const [mediaMode, setMediaMode] = useState<'image' | 'video'>('image');

  const product = selectedProductForDetail;

  const productVideo = product?.video || product?.videoUrl;

  const allImages = useMemo(() => {
    if (!product) return [];
    const list = [product.image, ...(product.images || []), ...(product.additionalImages || [])];
    return Array.from(new Set(list.filter(Boolean)));
  }, [product]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setMediaMode('image');
      if (product.variants && product.variants.length > 0) {
        setSelectedStitching(product.variants[0].name);
      } else {
        setSelectedStitching('Negro Clásico');
      }
    }
  }, [product]);

  if (!selectedProductForDetail || !product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      stitchingColor: selectedStitching,
    });
    setSelectedProductForDetail(null);
  };

  const handleWhatsAppConsult = () => {
    const rawNumber = (storeSettings?.whatsappNumber || '5491112345678').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `¡Hola Distribuidora Buenos Aires! 👋 Estoy interesado en el producto "${product.name}" (${formatProductPrice(product)}).\n` +
      `¿Tienen disponibilidad en stock para entrega o envío inmediato?`
    );
    window.open(`https://wa.me/${rawNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedProductForDetail(null)}
          className="absolute top-4 right-4 z-10 p-2 text-slate-600 hover:text-slate-900 bg-slate-100/80 rounded-full border border-slate-200 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
          
          {/* Product Media Column */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group flex items-center justify-center">
              {mediaMode === 'video' && productVideo ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <VideoPlayer src={productVideo} autoPlay controls className="w-full h-full" />
                </div>
              ) : (
                <img
                  src={activeImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
                <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white font-mono text-[10px] uppercase tracking-wider rounded-md font-bold">
                  SKU: {product.sku}
                </span>
                {product.isFeatured && (
                  <span className="px-2.5 py-1 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    Destacado
                  </span>
                )}
              </div>

              {/* Media Mode Pill Indicator (If video available) */}
              {productVideo && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMediaMode('image')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                      mediaMode === 'image' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" /> Fotos
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaMode('video')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                      mediaMode === 'video' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" /> Video HD
                  </button>
                </div>
              )}
            </div>

            {/* Media Gallery Thumbnails */}
            {(allImages.length > 1 || productVideo) && (
              <div className="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImage(img);
                      setMediaMode('image');
                    }}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      mediaMode === 'image' && (activeImage || product.image) === img
                        ? 'border-blue-600 shadow-md ring-2 ring-blue-500/30 scale-105'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}

                {productVideo && (
                  <button
                    type="button"
                    onClick={() => setMediaMode('video')}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-900 flex flex-col items-center justify-center gap-1 ${
                      mediaMode === 'video'
                        ? 'border-red-600 shadow-md ring-2 ring-red-500/30 scale-105 text-red-400'
                        : 'border-slate-300 opacity-70 hover:opacity-100 text-white'
                    }`}
                    title="Ver Video del Producto"
                  >
                    <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white shadow">
                      <Play className="w-3 h-3 fill-white ml-0.5" />
                    </div>
                    <span className="text-[9px] font-bold tracking-tight">VIDEO</span>
                  </button>
                )}
              </div>
            )}

            {/* Badges Info */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <strong className="text-[11px] text-slate-900 block font-bold leading-tight">Garantía Escrita</strong>
                  <span className="text-[10px] text-slate-500">3 Años de Cobertura</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <strong className="text-[11px] text-slate-900 block font-bold leading-tight">Envío Inmediato</strong>
                  <span className="text-[10px] text-slate-500">Todo el país</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info Column */}
          <div className="flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 font-bold block mb-1">
                  {product.category}
                </span>
                <h2 className="font-display font-extrabold text-2xl text-slate-900 leading-snug">
                  {product.name}
                </h2>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-900 font-mono">{product.rating}</span>
                  <span className="text-xs text-slate-500">({product.reviewsCount || 24} reseñas verificadas)</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Price Block */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 block">
                    Precio Total
                  </span>
                  <span className="font-mono font-extrabold text-2xl text-slate-900 tabular-nums">
                    {formatProductPrice(product)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 justify-end">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    En Stock ({product.stock} disp.)
                  </span>
                  <span className="text-[10px] text-slate-500">Despacho inmediato</span>
                </div>
              </div>

              {/* Stitching / Variant Options */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Color / Variante
                </label>
                <div className="flex flex-wrap gap-2">
                  {(product.variants && product.variants.length > 0
                    ? product.variants.map((v) => v.name)
                    : ['Negro Pleno', 'Negro con Gris', 'Negro con Rojo', 'Negro con Azul']
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setSelectedStitching(st);
                        const matchedVar = product.variants?.find((v) => v.name === st);
                        if (matchedVar?.image) {
                          setActiveImage(matchedVar.image);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedStitching === st
                          ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Features Bullets */}
              <div>
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                  Ventajas Principales
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {product.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions: Add to Cart + WhatsApp */}
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-slate-900 font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-slate-900 font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    Agregar al Carrito (
                    {product.currency === 'USD'
                      ? `US$ ${Math.round(product.priceUSD * quantity).toLocaleString('en-US')}`
                      : `$ ${Math.round((product.priceARS || (product.priceUSD * 1250)) * quantity).toLocaleString('es-AR')}`}
                    )
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleWhatsAppConsult}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>Consultar Disponibilidad por WhatsApp</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
