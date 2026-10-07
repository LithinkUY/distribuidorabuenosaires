import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { ShoppingBag, Eye, Star, Search, ShieldCheck, ArrowRight, Sparkles, Play } from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    categories,
    addToCart,
    formatPrice,
    formatProductPrice,
    setSelectedProductForDetail,
    selectedVehicle,
    storeSettings,
    selectedCategory,
    setSelectedCategory,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'destacados' | 'precio-menor' | 'precio-mayor' | 'rating'>('destacados');

  // Filter products
  const filteredProducts = products.filter((p) => {
    // Category match
    const matchesCategory = !selectedCategory || selectedCategory === 'todos' || p.category === selectedCategory;

    // Search query match
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    // Vehicle compatibility filter if vehicle is selected
    const matchesVehicle =
      !selectedVehicle.brand ||
      p.compatibleBrands.includes(selectedVehicle.brand) ||
      p.compatibleBrands.includes('Universal');

    return matchesCategory && matchesSearch && matchesVehicle;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'precio-menor') return a.priceUSD - b.priceUSD;
    if (sortBy === 'precio-mayor') return b.priceUSD - a.priceUSD;
    if (sortBy === 'rating') return b.rating - a.rating;
    // Default: featured first
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const sectionConfig = storeSettings?.homeSections?.find(s => s.id === 'productos');
  if (sectionConfig && !sectionConfig.visible) return null;

  return (
    <section id="productos" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-slate-200/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-500 mb-2">
              <span>Colección Oficial</span>
              <span aria-hidden="true">·</span>
              <span>Stock Inmediato</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Catálogo de Fundas y Accesorios
            </h2>
          </div>

          {/* Quick stats / count & View all products CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-xs text-slate-600">
              Mostrando <strong className="text-slate-900 font-mono">{sortedProducts.length}</strong> de <strong className="text-slate-900 font-mono">{products.length}</strong> productos
              {selectedVehicle.brand && (
                <span className="ml-2 text-blue-600">
                  (Compatibles con {selectedVehicle.brand} {selectedVehicle.model})
                </span>
              )}
            </div>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all hover:gap-3"
            >
              <span>Ver todos los productos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Filter Bar Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          
          {/* Category tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2 scrollbar-none flex-1">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                !selectedCategory || selectedCategory === 'todos'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-50/40'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Todos los Modelos
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === c.name
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-50/40'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search Input & Sort */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por auto o material..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="destacados">Más Destacados</option>
              <option value="precio-menor">Menor Precio</option>
              <option value="precio-mayor">Mayor Precio</option>
              <option value="rating">Mejor Calificados</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid: 3-column desktop layout adhering to design rules */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-slate-100/30 rounded-2xl border border-slate-200">
            <p className="text-slate-600 text-sm mb-2">No se encontraron productos con los filtros seleccionados.</p>
            <button
              onClick={() => {
                setActiveCategory('todos');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-blue-500 hover:text-blue-600 underline"
            >
              Limpiar filtros de búsqueda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectDetail={() => setSelectedProductForDetail(product)}
                onAddToCart={() => addToCart(product, 1)}
                formatPrice={formatPrice}
                formatProductPrice={formatProductPrice}
              />
            ))}
          </div>
        )}

        {/* Bottom Banner to Full Catalog */}
        <div className="mt-12 p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Stock Completo y Envíos a Todo el País
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              ¿Buscás explorar todo nuestro catálogo con filtros avanzados?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Accedé a la página completa con filtros por vehículo, material, rango de precios en pesos y videos demostrativos.
            </p>
          </div>
          <Link
            to="/catalogo"
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-transform active:scale-95 whitespace-nowrap flex items-center gap-2 shrink-0"
          >
            <span>Ver todos los productos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};

interface ProductCardProps {
  product: Product;
  onSelectDetail: () => void;
  onAddToCart: () => void;
  formatPrice: (amountUSD: number) => string;
  formatProductPrice: (product: Product) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectDetail,
  onAddToCart,
  formatPrice,
  formatProductPrice,
}) => {
  return (
    <article className="group bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-black/50">
      
      {/* Product Image Viewport (takes 65%-75% visual prominence) */}
      <div
        onClick={onSelectDetail}
        className="relative aspect-[4/3] w-full bg-white overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Video indicator badge */}
        {(product.video || product.videoUrl) && (
          <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow flex items-center gap-1 z-10">
            <Play className="w-2.5 h-2.5 fill-white" />
            <span>Video HD</span>
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectDetail();
            }}
            className="p-3 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-900 border border-slate-300 transition-transform active:scale-95 shadow-lg"
            title="Ver detalles completos"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-transform active:scale-95 shadow-lg flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>

        {/* Stock status indicator strictly adhering to zero-pill rule (clean unboxed subtle badge) */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-sm text-black font-extrabold text-[10px] px-2 py-0.5 rounded shadow">
            Últimas {product.stock} unidades
          </div>
        )}
      </div>

      {/* Card Content & Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating (Unboxed metadata with typographic separators) */}
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-slate-600">
              {product.category}
            </span>
            <div className="flex items-center gap-1 font-mono text-[11px] text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-500">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={onSelectDetail}
            className="font-display font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 mb-2 leading-snug"
          >
            {product.name}
          </h3>

          {/* Material & Feature summary */}
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
            <span className="truncate">{product.material}</span>
            {product.variants && product.variants.length > 0 ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-blue-600 font-semibold">{product.variants.length} colores</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500">{product.compatibleBrands.slice(0, 3).join(', ')}</span>
              </>
            )}
          </div>
        </div>

        {/* Bottom Bar: Price in Tabular figures + Buy Button */}
        <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Precio Final</span>
            <span className="font-mono font-bold text-lg text-slate-900 tabular-nums">
              {formatProductPrice(product)}
            </span>
          </div>

          <button
            onClick={onAddToCart}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Al Carrito</span>
          </button>
        </div>
      </div>
    </article>
  );
};
