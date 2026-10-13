import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariant } from '../../types';
import { ShoppingBag, Check, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';

interface FeaturedHeroProductProps {
  productId?: string;
  onOpenCheckout?: () => void;
}

export const FeaturedHeroProduct: React.FC<FeaturedHeroProductProps> = ({
  productId = 'wix-kit-bondeado',
  onOpenCheckout,
}) => {
  const { products, addToCart, formatPrice, setIsCartOpen } = useStore();

  // Find product by id or fallback to first product with bondeado or first product
  const product: Product | undefined =
    products.find((p) => p.id === productId) ||
    products.find((p) => p.id.includes('bondeado')) ||
    products[0];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  // Synchronize initial variant and image
  useEffect(() => {
    if (product) {
      const initialVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
      setSelectedVariant(initialVariant);
      setSelectedImage(initialVariant?.image || product.image || (product.images && product.images[0]) || '');
      setQuantity(1);
    }
  }, [product?.id]);

  if (!product) return null;

  // Gather all unique images for the thumbnail strip
  const allImages: string[] = Array.from(
    new Set([
      product.image,
      ...(product.images || []),
      ...(product.additionalImages || []),
      ...(product.variants || []).map((v) => v.image).filter(Boolean) as string[],
    ])
  ).filter(Boolean);

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    if (variant.image) {
      setSelectedImage(variant.image);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant ? { stitchingColor: selectedVariant.name } : undefined);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2200);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant ? { stitchingColor: selectedVariant.name } : undefined);
    if (onOpenCheckout) {
      onOpenCheckout();
    } else {
      setIsCartOpen(true);
    }
  };

  // Determine variant option group label
  const variantLabel =
    product.name.toLowerCase().includes('tonalidad') || product.material.toLowerCase().includes('bondeado')
      ? 'Tonalidad'
      : 'Color';

  return (
    <section className="bg-black text-white py-10 md:py-16 border-b border-zinc-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Image Gallery with Vertical Thumbnails matching Wix screenshot */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            
            {/* Vertical thumbnails strip */}
            {allImages.length > 1 && (
              <div className="order-2 sm:order-1 flex sm:flex-col gap-2 max-h-[480px] overflow-y-auto overflow-x-hidden scrollbar-none py-1">
                {allImages.slice(0, 8).map((img, idx) => {
                  const isActive = selectedImage === img;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                        isActive
                          ? 'border-white scale-105 shadow-md shadow-red-900/20'
                          : 'border-zinc-800 hover:border-zinc-500 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Vista ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Stage Image */}
            <div className="order-1 sm:order-2 flex-1 w-full bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800/80 shadow-2xl relative group aspect-[4/3] sm:aspect-auto sm:min-h-[440px] flex items-center justify-center">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full max-h-[500px] object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              {selectedVariant && (
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-zinc-700 text-white text-[11px] font-medium px-2.5 py-1 rounded">
                  {selectedVariant.name}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT: Product Details, Variant Buttons, Quantity, Buy Actions */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-5">
            
            {/* Title */}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-tight font-display">
                {product.name}
              </h1>
              
              {/* Price */}
              <div className="mt-2 text-lg sm:text-xl font-semibold text-zinc-100">
                {formatPrice(product.priceUSD, product.priceARS)}
              </div>
            </div>

            {/* Variants Selector matching Wix style */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  {variantLabel} <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariant(v)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded border transition-all ${
                          isSelected
                            ? 'bg-transparent text-white border-white ring-1 ring-white shadow-sm'
                            : 'bg-black text-zinc-300 border-zinc-700 hover:border-zinc-400 hover:text-white'
                        }`}
                      >
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Cantidad <span className="text-red-500">*</span>
              </label>
              <div className="inline-flex items-center border border-zinc-700 rounded bg-black">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-sm"
                  aria-label="Restar cantidad"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-semibold text-white min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-sm"
                  aria-label="Sumar cantidad"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons matching Wix screenshot: Red "Agregar al carrito" + White "Realizar compra" */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3.5 px-6 bg-[#e52525] hover:bg-[#c91d1d] active:scale-[0.99] text-white font-bold text-sm uppercase tracking-wider rounded transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Agregar al carrito</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3 px-6 bg-white hover:bg-zinc-100 active:scale-[0.99] text-black font-bold text-sm tracking-wide rounded transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Realizar compra</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Description matching Wix site text */}
            {product.description && (
              <div className="pt-3 border-t border-zinc-900 text-xs text-zinc-400 leading-relaxed">
                <p>{product.description.split('\n')[0]}</p>
                {product.features && product.features.length > 0 && (
                  <ul className="mt-2 space-y-1 list-disc list-inside text-zinc-400">
                    {product.features.slice(0, 4).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};
