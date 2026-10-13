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
import { ErrorBoundary } from './components/ErrorBoundary';

// Wix-style Showcase Components
import { ProductSliderCarousel } from './components/showcase/ProductSliderCarousel';
import { FullWidthDegradeSlider } from './components/showcase/FullWidthDegradeSlider';
import { FeaturedHeroProduct } from './components/showcase/FeaturedHeroProduct';
import { ShowcaseModelsGrid } from './components/showcase/ShowcaseModelsGrid';
import { ShowcaseBanners } from './components/showcase/ShowcaseBanners';
import { ShowcaseMaintenance } from './components/showcase/ShowcaseMaintenance';
import { ShowcaseManufacturers } from './components/showcase/ShowcaseManufacturers';
import { ShowcaseShipping } from './components/showcase/ShowcaseShipping';
import { ShowcaseTestimonials } from './components/showcase/ShowcaseTestimonials';
import { resolveShowcase, mergeHomeSections } from './components/showcase/showcaseConfig';


function AdminRoute() {
  const { isAdmin, setIsAuthModalOpen } = useStore();
  
  if (!isAdmin) {
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
  const {
    isAdmin,
    setIsFitterOpen,
    setIsWholesaleOpen,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
    setIsCheckoutOpen,
    storeSettings,
  } = useStore();
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

  const showcaseConfig = resolveShowcase(storeSettings?.showcase);
  const homeSections = mergeHomeSections(storeSettings?.homeSections);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-red-600 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Header onNavigate={scrollToSection} activeSection={activeSection} />

      {/* Main Content Sections */}
      <main className="flex-1 bg-black">
        {/* Hero Banner matching image.png */}
        <Hero onExplore={() => scrollToSection('carrusel-productos')} />

        {/* Dynamic Home Sections (Reorderable & Configurable via CMS) */}
        {homeSections
          .filter((sec) => sec.visible !== false)
          .map((sec) => {
            switch (sec.id) {
              case 'carrusel_productos':
                return (
                  <ProductSliderCarousel
                    key="carrusel_productos"
                    title={sec.title || showcaseConfig.carousel.title}
                    subtitle={sec.subtitle || showcaseConfig.carousel.subtitle}
                    productIds={showcaseConfig.carousel.productIds}
                    buttonText={showcaseConfig.carousel.buttonText || '+ comprar'}
                  />
                );
              case 'slider_pantalla_completa':
                return (
                  <FullWidthDegradeSlider
                    key="slider_pantalla_completa"
                    slides={showcaseConfig.fullWidthSlider?.slides}
                    onOpenCatalog={() => scrollToSection('productos')}
                  />
                );
              case 'destacado_wix':
                return (
                  <FeaturedHeroProduct
                    key="destacado_wix"
                    productId={showcaseConfig.models.productIds[0]}
                    onOpenCheckout={() => setIsCheckoutOpen(true)}
                  />
                );
              case 'modelos':
                return (
                  <ShowcaseModelsGrid
                    key="modelos"
                    title={sec.title || showcaseConfig.models.title}
                    subtitle={sec.subtitle || showcaseConfig.models.subtitle}
                  />
                );
              case 'banners':
                return (
                  <ShowcaseBanners
                    key="banners"
                    banners={showcaseConfig.banners}
                    onOpenCatalog={() => scrollToSection('productos')}
                  />
                );
              case 'mantenimiento':
                return (
                  <ShowcaseMaintenance
                    key="mantenimiento"
                    kicker={showcaseConfig.maintenance.kicker}
                    title={sec.title || showcaseConfig.maintenance.title}
                    cards={showcaseConfig.maintenance.cards}
                  />
                );
              case 'fabricantes':
                return (
                  <ShowcaseManufacturers
                    key="fabricantes"
                    title={sec.title || showcaseConfig.manufacturers.title}
                    text={sec.subtitle || showcaseConfig.manufacturers.text}
                    image={showcaseConfig.manufacturers.image}
                    orderKicker={showcaseConfig.manufacturers.orderKicker}
                    orderTitle={showcaseConfig.manufacturers.orderTitle}
                    orderText={showcaseConfig.manufacturers.orderText}
                    steps={showcaseConfig.manufacturers.steps}
                  />
                );
              case 'envios':
                return (
                  <ShowcaseShipping
                    key="envios"
                    title={sec.title || showcaseConfig.shipping.title}
                    text={sec.subtitle || showcaseConfig.shipping.text}
                    image={showcaseConfig.shipping.image}
                    buttonText={showcaseConfig.shipping.buttonText}
                    buttonUrl={showcaseConfig.shipping.buttonUrl}
                  />
                );
              case 'testimonios':
                return (
                  <ShowcaseTestimonials
                    key="testimonios"
                    title={sec.title || showcaseConfig.testimonials.title}
                    items={showcaseConfig.testimonials.items}
                  />
                );
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
    <ErrorBoundary>
      <StoreProvider>
        <Router>
          <Routes>
            <Route path="/" element={<StorefrontContent />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/productos" element={<Navigate to="/catalogo" replace />} />
            <Route
              path="/admin"
              element={
                <ErrorBoundary>
                  <AdminRoute />
                </ErrorBoundary>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </StoreProvider>
    </ErrorBoundary>
  );
}
