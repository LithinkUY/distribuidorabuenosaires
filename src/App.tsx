import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { VirtualFitter } from './components/VirtualFitter';
import { ProductCatalog } from './components/ProductCatalog';
import { AlfombrasSection } from './components/AlfombrasSection';
import { ReviewsSection } from './components/ReviewsSection';
import { ContactSection } from './components/ContactSection';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WholesaleModal } from './components/WholesaleModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Footer } from './components/Footer';
import { CatalogPage } from './pages/CatalogPage';
import { Car, ShieldCheck, PhoneCall, Mail, MapPin, Sparkles, Heart } from 'lucide-react';


function AdminRoute() {
  const { isAdmin, setIsAuthModalOpen, currentUser } = useStore();
  
  if (!isAdmin) {
    // If not logged in as admin, we should maybe show a specific admin login or trigger AuthModal
    // For simplicity, let's render a basic login directly here
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Acceso Admin - Distribuidora BA</h2>
          <p className="text-slate-600 text-sm mb-6">Inicia sesión con tu cuenta de administrador.</p>
          <button onClick={() => setIsAuthModalOpen(true)} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl">Abrir Modal de Login</button>
          <a href="/" className="block mt-4 text-slate-500 hover:text-slate-900 text-sm">Volver a la tienda</a>
        </div>
        <AuthModal />
      </div>
    );
  }
  return <AdminDashboard />;
}

function StorefrontContent() {
  const { isAdmin, setIsFitterOpen, setIsWholesaleOpen, setIsAuthModalOpen, currentUser, setIsProfileModalOpen, storeSettings } = useStore();
  const [activeSection, setActiveSection] = useState('hero');

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Header onNavigate={scrollToSection} activeSection={activeSection} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Banner matching image.png */}
        <Hero onExplore={() => scrollToSection('productos')} />

        {/* Dynamic Home Sections (Reorderable & Configurable via CMS) */}
        {(storeSettings?.homeSections && storeSettings.homeSections.length > 0
          ? storeSettings.homeSections
          : [
              { id: 'productos', title: '', visible: true },
              { id: 'alfombras', title: '', visible: true },
              { id: 'resenas', title: '', visible: true },
              { id: 'contacto', title: '', visible: true },
            ]
        )
          .filter((sec) => sec.visible !== false)
          .map((sec) => {
            switch (sec.id) {
              case 'productos':
                return <ProductCatalog key="productos" />;
              case 'alfombras':
                return <AlfombrasSection key="alfombras" />;
              case 'resenas':
                return <ReviewsSection key="resenas" />;
              case 'contacto':
                return <ContactSection key="contacto" />;
              default:
                return null;
            }
          })}
      </main>

      {/* Footer */}
      <Footer
        onOpenFitter={() => setIsFitterOpen(true)}
        onOpenWholesale={() => setIsWholesaleOpen(true)}
        scrollToSection={scrollToSection}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Interactive Overlays & Modals */}
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
}

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StorefrontContent />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/productos" element={<Navigate to="/catalogo" replace />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </StoreProvider>
  );
}
