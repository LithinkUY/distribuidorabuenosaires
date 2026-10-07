import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Currency } from '../types';
import { ShoppingBag, ShieldCheck, PhoneCall, Menu, X, Car, User as UserIcon, Search } from 'lucide-react';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activeSection }) => {
  const {
    cartItemsCount,
    setIsCartOpen,
    currency,
    setCurrency,
    isAdmin,
    setIsAdmin,
    setIsFitterOpen,
    setIsWholesaleOpen,
    currentUser,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
    storeSettings,
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    formatPrice,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const searchResults = searchQuery.trim() === '' ? [] : products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const navLinks = (storeSettings?.menuItems && storeSettings.menuItems.length >= 7)
    ? storeSettings.menuItems
    : [
        { id: 'm-todos', label: 'Todos los Modelos', link: 'todos' },
        ...categories.map(c => ({ id: c.id, label: c.name, link: c.name }))
      ];

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'admin123' || adminPasswordInput === 'distribuidora' || adminPasswordInput === 'cubreasiento') {
      setIsAdmin(true);
      setShowAdminLoginModal(false);
      setAdminPasswordInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleNavClick = (link: any) => {
    if (link.link === 'todos' || link.id === 'm-todos' || link.label === 'Todos los Modelos') {
      setSelectedCategory('todos');
      onNavigate('productos');
    } else if (categories.some(c => c.name === link.label || c.name === link.link)) {
      const match = categories.find(c => c.name === link.label || c.name === link.link);
      setSelectedCategory(match ? match.name : link.label);
      onNavigate('productos');
    } else if (link.action) {
      link.action();
    } else if (link.link) {
      onNavigate(link.link);
    } else {
      onNavigate(link.id);
    }
    setMobileMenuOpen(false);
  };

  const openWhatsAppDirect = () => {
    const rawNumber = (storeSettings?.whatsappNumber || '5491112345678').replace(/[^0-9]/g, '');
    const message = encodeURIComponent('¡Hola! Me comunico desde el sitio web de Distribuidora Buenos Aires para consultar por fundas y accesorios disponibles.');
    window.open(`https://wa.me/${rawNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 flex flex-col transition-all duration-300 shadow-xl">
        
        {/* TOP BAR (Logo, Search, Buttons) */}
        <div style={{ backgroundColor: storeSettings?.headerBgColor || '#ffffff', color: storeSettings?.headerTextColor || '#1e293b' }} className="border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
            
            {/* Zone 1: Clean Logo */}
            <div 
              className="flex-shrink-0 cursor-pointer flex items-center" 
              onClick={() => onNavigate('hero')}
            >
              {storeSettings?.logoUrl ? (
                <img src={storeSettings.logoUrl} alt="Logo" style={{ height: (storeSettings.logoSize || 40) + 'px', objectFit: 'contain' }} />
              ) : (
                <span className="font-display font-extrabold text-lg md:text-xl tracking-wider uppercase leading-tight">
                  {storeSettings?.businessName || 'Distribuidora Buenos Aires'}
                </span>
              )}
            </div>

            {/* Zone 2: MercadoLibre Style Search Bar (Desktop) */}
            <div className="hidden md:block flex-1 max-w-3xl relative">
              <div className="relative flex items-center w-full group">
                <input
                  type="text"
                  placeholder="Buscar productos, marcas y más..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full bg-slate-100 border border-slate-300/80 rounded-full pl-5 pr-12 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner group-hover:border-zinc-600"
                />
                <button className="absolute right-3 text-slate-600 hover:text-blue-500 transition-colors p-1">
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Search Results Dropdown */}
              {isSearchOpen && searchQuery && (
                <div className="absolute top-full mt-2 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                  <div className="max-h-[60vh] overflow-y-auto">
                    {searchResults.length === 0 ? (
                      <p className="text-slate-500 text-sm p-6 text-center">No se encontraron productos para "{searchQuery}".</p>
                    ) : (
                      searchResults.map(p => (
                        <div key={p.id} className="flex items-center gap-4 p-3 hover:bg-slate-100 border-b border-slate-200/50 cursor-pointer transition-colors" onClick={() => { onNavigate('productos'); setIsSearchOpen(false); }}>
                          <img src={p.image} className="w-12 h-12 rounded-lg bg-black object-cover border border-slate-200" alt={p.name} />
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 text-sm font-semibold truncate">{p.name}</p>
                            <p className="text-slate-600 text-xs truncate">{p.category}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-slate-900 font-bold text-sm">{formatPrice(p.priceUSD)}</div>
                            <div className="text-emerald-400 text-[10px] font-medium tracking-wide uppercase">Stock: {p.stock}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Zone 3: Actions */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button
                onClick={openWhatsAppDirect}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  if (currentUser) setIsProfileModalOpen(true);
                  else setIsAuthModalOpen(true);
                }}
                className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-lg transition-all"
              >
                {currentUser ? (
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500 text-blue-600 text-[10px] font-bold flex items-center justify-center font-mono">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-lg transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* SUB-HEADER (Categories / CMS Menus) */}
        <div className={`bg-slate-100 border-b border-slate-200 px-4 sm:px-6 lg:px-8 hidden md:block shadow-md transition-all duration-300 overflow-hidden ${isScrolled ? "max-h-0 py-0 border-transparent opacity-0" : "max-h-36 py-2 opacity-100"}`}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-1.5 sm:gap-2 py-0.5">
            {navLinks.map((link) => {
              const isSelected = (!selectedCategory || selectedCategory === 'todos')
                ? (link.link === 'todos' || link.id === 'm-todos' || link.label === 'Todos los Modelos')
                : (selectedCategory === link.label || selectedCategory === link.link);

              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 font-medium'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-full pl-4 pr-10 py-2.5 text-sm text-slate-900 focus:border-blue-500"
              />
              <Search className="absolute right-3 w-4 h-4 text-slate-600" />
            </div>
            
            <div className="space-y-1 pt-2">
              {navLinks.map((link) => {
                const isSelected = (!selectedCategory || selectedCategory === 'todos')
                  ? (link.link === 'todos' || link.id === 'm-todos' || link.label === 'Todos los Modelos')
                  : (selectedCategory === link.label || selectedCategory === link.link);

                return (
                  <button
                    key={link.id}
                    onClick={() => { handleNavClick(link); setMobileMenuOpen(false); }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </header>
    </>
  );
};
