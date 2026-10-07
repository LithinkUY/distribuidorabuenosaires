import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { WholesaleModal } from '../components/WholesaleModal';
import { AuthModal } from '../components/auth/AuthModal';
import { ProfileModal } from '../components/auth/ProfileModal';
import { VirtualFitter } from '../components/VirtualFitter';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  Home,
  ShoppingBag,
  Eye,
  Star,
  Check,
  X,
  Play,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Car,
  Filter,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    products,
    categories,
    addToCart,
    formatPrice,
    formatProductPrice,
    setSelectedProductForDetail,
    selectedVehicle,
    setSelectedVehicle,
    selectedCategory,
    setSelectedCategory,
    setIsFitterOpen,
    setIsWholesaleOpen,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
  } = useStore();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('todas');
  const [selectedMaterial, setSelectedMaterial] = useState('todos');
  const [pricePreset, setPricePreset] = useState<'all' | 'under100k' | '100k-200k' | 'over200k' | 'custom'>('all');
  const [customMinPrice, setCustomMinPrice] = useState<number | ''>('');
  const [customMaxPrice, setCustomMaxPrice] = useState<number | ''>('');
  const [onlyWithVideo, setOnlyWithVideo] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'destacados' | 'precio-menor' | 'precio-mayor' | 'rating' | 'stock' | 'nombre'>('destacados');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Available brands list
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => {
      p.compatibleBrands.forEach((b) => brandSet.add(b));
    });
    return Array.from(brandSet).sort();
  }, [products]);

  // Available materials list
  const availableMaterials = useMemo(() => {
    const matSet = new Set<string>();
    products.forEach((p) => {
      if (p.material) matSet.add(p.material);
    });
    return Array.from(matSet).sort();
  }, [products]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: products.length };
    categories.forEach((cat) => {
      counts[cat.name] = products.filter((p) => p.category === cat.name).length;
    });
    return counts;
  }, [products, categories]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory && selectedCategory !== 'todos') count++;
    if (searchQuery.trim()) count++;
    if (selectedBrand !== 'todas') count++;
    if (selectedMaterial !== 'todos') count++;
    if (pricePreset !== 'all') count++;
    if (onlyWithVideo) count++;
    if (onlyInStock) count++;
    return count;
  }, [selectedCategory, searchQuery, selectedBrand, selectedMaterial, pricePreset, onlyWithVideo, onlyInStock]);

  // Reset all filters
  const resetAllFilters = () => {
    setSelectedCategory('todos');
    setSearchQuery('');
    setSelectedBrand('todas');
    setSelectedMaterial('todos');
    setPricePreset('all');
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setOnlyWithVideo(false);
    setOnlyInStock(false);
    setSortBy('destacados');
  };

  // Filter products logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category
      if (selectedCategory && selectedCategory !== 'todos' && p.category !== selectedCategory) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Brand
      if (selectedBrand !== 'todas') {
        const hasBrand = p.compatibleBrands.includes(selectedBrand) || p.compatibleBrands.includes('Universal');
        if (!hasBrand) return false;
      }

      // Material
      if (selectedMaterial !== 'todos' && p.material !== selectedMaterial) {
        return false;
      }

      // Video only
      if (onlyWithVideo && !(p.video || p.videoUrl)) {
        return false;
      }

      // In stock only
      if (onlyInStock && p.stock <= 0) {
        return false;
      }

      // Price Filter (based on priceARS or calculated)
      const price = p.priceARS || p.priceUSD * 1250;
      if (pricePreset === 'under100k' && price > 100000) return false;
      if (pricePreset === '100k-200k' && (price < 100000 || price > 200000)) return false;
      if (pricePreset === 'over200k' && price < 200000) return false;
      if (pricePreset === 'custom') {
        if (customMinPrice !== '' && price < customMinPrice) return false;
        if (customMaxPrice !== '' && price > customMaxPrice) return false;
      }

      return true;
    });
  }, [
    products,
    selectedCategory,
    searchQuery,
    selectedBrand,
    selectedMaterial,
    onlyWithVideo,
    onlyInStock,
    pricePreset,
    customMinPrice,
    customMaxPrice,
  ]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = a.priceARS || a.priceUSD * 1250;
      const priceB = b.priceARS || b.priceUSD * 1250;

      if (sortBy === 'precio-menor') return priceA - priceB;
      if (sortBy === 'precio-mayor') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'stock') return b.stock - a.stock;
      if (sortBy === 'nombre') return a.name.localeCompare(b.name);
      // Default: featured first
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [filteredProducts, sortBy]);

  const handleHeaderNavigate = (sec: string) => {
    if (sec === 'productos' || sec === 'catalogo') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(`/#${sec}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header onNavigate={handleHeaderNavigate} activeSection="catalogo" />

      {/* Main Container */}
      <main className="flex-1 pt-24 sm:pt-28 pb-20">
        
        {/* Breadcrumb & Hero Banner */}
        <div className="bg-slate-900 text-white border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3">
              <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
                <Home className="w-3.5 h-3.5" />
                <span>Inicio</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-blue-400 font-semibold">Catálogo Completo</span>
              {selectedCategory && selectedCategory !== 'todos' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-slate-200 font-medium truncate max-w-xs">{selectedCategory}</span>
                </>
              )}
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Distribuidora Buenos Aires · Catálogo Oficial</span>
                </div>
                <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                  Catálogo Completo de Fundas & Accesorios
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
                  Encontrá fundas en ecocuero, bondeadas acolchadas, cuero automotor, cubrevolantes y bandejas de piso con fotos, videos y despacho inmediato.
                </p>
              </div>

              {/* Total counter badge */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-5 py-3 text-right shrink-0">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Resultados</span>
                <span className="font-mono font-extrabold text-2xl text-blue-400">
                  {sortedProducts.length}{' '}
                  <span className="text-xs text-slate-300 font-normal">de {products.length} productos</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout: Left Sidebar Filters + Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          
          {/* Mobile Filter Toggle & Quick Search */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 shadow-sm flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar modelo o material..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* DESKTOP SIDEBAR FILTERS (Column 1) */}
            <aside className="hidden lg:block lg:col-span-1 space-y-6">
              
              {/* Header filter title */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    <span>Filtros Avanzados</span>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetAllFilters}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Limpiar ({activeFiltersCount})</span>
                    </button>
                  )}
                </div>

                {/* 1. Category Filter */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                    Categorías
                  </label>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('todos')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                        !selectedCategory || selectedCategory === 'todos'
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>Todos los Modelos</span>
                      <span className="font-mono text-[11px] opacity-80">{categoryCounts['todos']}</span>
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCategory(c.name)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                          selectedCategory === c.name
                            ? 'bg-blue-600 text-white font-bold shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate pr-2">{c.name}</span>
                        <span className="font-mono text-[11px] opacity-80 shrink-0">
                          {categoryCounts[c.name] || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Brand / Vehicle Filter */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-blue-600" />
                    <span>Compatibilidad de Vehículo</span>
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="todas">Todas las marcas / Universal</option>
                    {availableBrands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Price Filter (ARS) */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Rango de Precio ($ ARS)
                  </label>
                  
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPricePreset('all')}
                      className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                        pricePreset === 'all' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setPricePreset('under100k')}
                      className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                        pricePreset === 'under100k' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Hasta $100k
                    </button>
                    <button
                      type="button"
                      onClick={() => setPricePreset('100k-200k')}
                      className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                        pricePreset === '100k-200k' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      $100k - $200k
                    </button>
                    <button
                      type="button"
                      onClick={() => setPricePreset('over200k')}
                      className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-colors ${
                        pricePreset === 'over200k' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Más de $200k
                    </button>
                  </div>

                  {/* Custom Price Range Inputs */}
                  <div className="pt-2">
                    <span className="text-[11px] text-slate-500 block mb-1.5">O ingresá rango manual:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Mín $"
                        value={customMinPrice}
                        onChange={(e) => {
                          setPricePreset('custom');
                          setCustomMinPrice(e.target.value === '' ? '' : Number(e.target.value));
                        }}
                        className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-400 text-xs">-</span>
                      <input
                        type="number"
                        placeholder="Máx $"
                        value={customMaxPrice}
                        onChange={(e) => {
                          setPricePreset('custom');
                          setCustomMaxPrice(e.target.value === '' ? '' : Number(e.target.value));
                        }}
                        className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Material Filter */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Material
                  </label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="todos">Todos los materiales</option>
                    {availableMaterials.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Content Toggles: Video & Stock */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Características
                  </label>
                  
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={onlyWithVideo}
                      onChange={(e) => setOnlyWithVideo(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="flex items-center gap-1.5 font-medium">
                      <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                      <span>Solo con Video HD</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="font-medium">Solo productos en stock</span>
                  </label>
                </div>

                {/* Reset button */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restablecer Filtros</span>
                  </button>
                )}

              </div>

              {/* Informative side card */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-950">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Distribuidora Buenos Aires</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Todos nuestros productos se entregan listos para colocar, con garantía oficial y despacho rápido a todo el país.
                </p>
              </div>

            </aside>

            {/* MAIN CATALOG COLUMN (Columns 2, 3, 4) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Top Controls Bar: Search, Active Tags, Sort */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                
                {/* Search Bar Desktop */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por auto, material o código..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Ordenar:</span>
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="destacados">Más Destacados</option>
                    <option value="precio-menor">Menor Precio ($ ARS)</option>
                    <option value="precio-mayor">Mayor Precio ($ ARS)</option>
                    <option value="rating">Mejor Calificados</option>
                    <option value="stock">Mayor Stock Disponible</option>
                    <option value="nombre">Nombre (A - Z)</option>
                  </select>
                </div>

              </div>

              {/* Active Filter Tags */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Filtros aplicados:</span>
                  
                  {selectedCategory && selectedCategory !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg">
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory('todos')}>
                        <X className="w-3 h-3 hover:text-blue-900" />
                      </button>
                    </span>
                  )}

                  {selectedBrand !== 'todas' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg">
                      Marca: {selectedBrand}
                      <button onClick={() => setSelectedBrand('todas')}>
                        <X className="w-3 h-3 hover:text-blue-900" />
                      </button>
                    </span>
                  )}

                  {pricePreset !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg">
                      Precio:{' '}
                      {pricePreset === 'under100k' && 'Hasta $100.000'}
                      {pricePreset === '100k-200k' && '$100.000 a $200.000'}
                      {pricePreset === 'over200k' && 'Más de $200.000'}
                      {pricePreset === 'custom' && `\$${customMinPrice || 0} - \$${customMaxPrice || '∞'}`}
                      <button onClick={() => { setPricePreset('all'); setCustomMinPrice(''); setCustomMaxPrice(''); }}>
                        <X className="w-3 h-3 hover:text-blue-900" />
                      </button>
                    </span>
                  )}

                  {onlyWithVideo && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
                      Con Video HD
                      <button onClick={() => setOnlyWithVideo(false)}>
                        <X className="w-3 h-3 hover:text-red-900" />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={resetAllFilters}
                    className="text-xs text-slate-500 hover:text-slate-800 underline ml-2 font-medium"
                  >
                    Borrar todos
                  </button>
                </div>
              )}

              {/* Products Grid */}
              {sortedProducts.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      No encontramos productos con esos filtros
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Probá cambiando el término de búsqueda o restableciendo los filtros para ver todo nuestro catálogo disponible.
                    </p>
                  </div>
                  <button
                    onClick={resetAllFilters}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Ver todos los productos</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
                  {sortedProducts.map((product) => {
                    const hasVideo = Boolean(product.video || product.videoUrl);
                    return (
                      <article
                        key={product.id}
                        className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-black/10"
                      >
                        {/* Image & Video Thumbnail */}
                        <div
                          onClick={() => setSelectedProductForDetail(product)}
                          className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden cursor-pointer"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Video Badge */}
                          {hasVideo && (
                            <div className="absolute top-3 right-3 bg-red-600/95 backdrop-blur-sm text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow flex items-center gap-1 z-10 animate-fade-in">
                              <Play className="w-2.5 h-2.5 fill-white" />
                              <span>Video HD</span>
                            </div>
                          )}

                          {/* Featured or SKU badge */}
                          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                            {product.isFeatured && (
                              <span className="px-2 py-0.5 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold rounded shadow flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Destacado
                              </span>
                            )}
                          </div>

                          {/* Stock badge */}
                          {product.stock <= 5 && product.stock > 0 && (
                            <div className="absolute bottom-3 left-3 bg-amber-500/90 backdrop-blur-sm text-black font-extrabold text-[10px] px-2 py-0.5 rounded shadow">
                              Últimas {product.stock} u.
                            </div>
                          )}

                          {/* Quick hover overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProductForDetail(product);
                              }}
                              className="p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 transition-transform active:scale-95 shadow-lg"
                              title="Ver detalles completos y video"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product, 1);
                              }}
                              className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-transform active:scale-95 shadow-lg flex items-center gap-2"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              <span>Agregar</span>
                            </button>
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            {/* Category & Rating */}
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                              <span className="uppercase tracking-wider font-semibold text-[11px] text-blue-600 truncate max-w-[180px]">
                                {product.category}
                              </span>
                              <div className="flex items-center gap-1 font-mono text-[11px] text-amber-500 shrink-0">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{product.rating.toFixed(1)}</span>
                                <span className="text-slate-400">({product.reviewsCount})</span>
                              </div>
                            </div>

                            {/* Title */}
                            <h3
                              onClick={() => setSelectedProductForDetail(product)}
                              className="font-display font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 mb-2 leading-snug"
                            >
                              {product.name}
                            </h3>

                            {/* Material & Variants */}
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                              <span className="truncate">{product.material}</span>
                              {product.variants && product.variants.length > 0 ? (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-blue-600 font-semibold shrink-0">
                                    {product.variants.length} colores
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-slate-400 truncate">
                                    {product.compatibleBrands.slice(0, 2).join(', ')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Price and Cart */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                                Precio Final
                              </span>
                              <span className="font-mono font-bold text-lg text-slate-900 tabular-nums">
                                {formatProductPrice(product)}
                              </span>
                            </div>

                            <button
                              onClick={() => addToCart(product, 1)}
                              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Al Carrito</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

        </div>

      </main>

      {/* MOBILE FILTERS MODAL */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/70 backdrop-blur-sm">
          <div className="relative bg-white w-full max-w-sm ml-auto h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                  <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                  <span>Filtros de Catálogo</span>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Categoría
                </label>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('todos');
                      setMobileFiltersOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${
                      !selectedCategory || selectedCategory === 'todos' ? 'bg-blue-600 text-white font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span>Todos los Modelos</span>
                    <span>{categoryCounts['todos']}</span>
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(c.name);
                        setMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${
                        selectedCategory === c.name ? 'bg-blue-600 text-white font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate pr-2">{c.name}</span>
                      <span>{categoryCounts[c.name] || 0}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Marca de Vehículo
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  <option value="todas">Todas las marcas</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Price Preset */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Rango de Precio ($ ARS)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPricePreset('all')}
                    className={`p-2 rounded-lg border text-center ${pricePreset === 'all' ? 'bg-blue-50 border-blue-600 font-bold text-blue-700' : 'border-slate-200'}`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricePreset('under100k')}
                    className={`p-2 rounded-lg border text-center ${pricePreset === 'under100k' ? 'bg-blue-50 border-blue-600 font-bold text-blue-700' : 'border-slate-200'}`}
                  >
                    Hasta $100k
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricePreset('100k-200k')}
                    className={`p-2 rounded-lg border text-center ${pricePreset === '100k-200k' ? 'bg-blue-50 border-blue-600 font-bold text-blue-700' : 'border-slate-200'}`}
                  >
                    $100k - $200k
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricePreset('over200k')}
                    className={`p-2 rounded-lg border text-center ${pricePreset === 'over200k' ? 'bg-blue-50 border-blue-600 font-bold text-blue-700' : 'border-slate-200'}`}
                  >
                    Más de $200k
                  </button>
                </div>
              </div>

              {/* Only with video */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={onlyWithVideo}
                  onChange={(e) => setOnlyWithVideo(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  <span>Solo productos con Video HD</span>
                </span>
              </label>

            </div>

            <div className="pt-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-3 bg-slate-100 font-bold text-xs rounded-xl text-slate-700"
              >
                Limpiar
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Ver ({sortedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer
        onOpenFitter={() => setIsFitterOpen(true)}
        onOpenWholesale={() => setIsWholesaleOpen(true)}
        scrollToSection={(sec) => navigate(`/#${sec}`)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Interactive Modals */}
      <VirtualFitter />
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <WholesaleModal />
      <AuthModal />
      <ProfileModal />
      <FloatingWhatsApp />
    </div>
  );
};
