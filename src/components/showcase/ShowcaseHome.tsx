import React from 'react';
import { useStore } from '../../context/StoreContext';
import { resolveShowcase } from './showcaseConfig';
import { ProductSliderCarousel } from './ProductSliderCarousel';
import { FullWidthDegradeSlider } from './FullWidthDegradeSlider';
import { FeaturedHeroProduct } from './FeaturedHeroProduct';
import { ShowcaseModelsGrid } from './ShowcaseModelsGrid';
import { ShowcaseBanners } from './ShowcaseBanners';
import { ShowcaseMaintenance } from './ShowcaseMaintenance';
import { ShowcaseManufacturers } from './ShowcaseManufacturers';
import { ShowcaseShipping } from './ShowcaseShipping';
import { ShowcaseTestimonials } from './ShowcaseTestimonials';
import { Product } from '../../types';

interface ShowcaseHomeProps {
  onOpenCheckout?: () => void;
  onOpenCatalog?: () => void;
  onSelectProduct?: () => void;
}

export const ShowcaseHome: React.FC<ShowcaseHomeProps> = ({
  onOpenCheckout,
  onOpenCatalog,
}) => {
  const { storeSettings } = useStore();
  const cfg = resolveShowcase(storeSettings?.showcase);

  return (
    <div className="bg-black text-white w-full">
      {/* 1. Horizontal Product Slider Carousel (directly below hero) */}
      <ProductSliderCarousel
        title={cfg.carousel.title}
        subtitle={cfg.carousel.subtitle}
        productIds={cfg.carousel.productIds}
        buttonText={cfg.carousel.buttonText}
      />

      {/* 2. Full-Width Degrade Banner / Slider */}
      <FullWidthDegradeSlider
        slides={cfg.fullWidthSlider.slides}
        onOpenCatalog={onOpenCatalog}
      />

      {/* 3. Featured Hero Product (Thumbnails + Variants + Buy) */}
      <FeaturedHeroProduct
        productId={cfg.models.productIds[0]}
        onOpenCheckout={onOpenCheckout}
      />

      {/* 4. Models with Perfect Fit Grid */}
      <ShowcaseModelsGrid
        title={cfg.models.title}
        subtitle={cfg.models.subtitle}
      />

      {/* 5. Category Split Banners (Alfombras, Cubre Volante, Cuero con Lumbar) */}
      <ShowcaseBanners
        banners={cfg.banners}
        onOpenCatalog={onOpenCatalog}
      />

      {/* 6. Maintenance Pro Cards (Limpiador Profundo, Brillo, Sellador) */}
      <ShowcaseMaintenance
        kicker={cfg.maintenance.kicker}
        title={cfg.maintenance.title}
        cards={cfg.maintenance.cards}
      />

      {/* 7. Somos Fabricantes & Proceso del Pedido */}
      <ShowcaseManufacturers
        title={cfg.manufacturers.title}
        text={cfg.manufacturers.text}
        image={cfg.manufacturers.image}
        orderKicker={cfg.manufacturers.orderKicker}
        orderTitle={cfg.manufacturers.orderTitle}
        orderText={cfg.manufacturers.orderText}
        steps={cfg.manufacturers.steps}
      />

      {/* 8. Envíos a Todo el País (Andreani) */}
      <ShowcaseShipping
        title={cfg.shipping.title}
        text={cfg.shipping.text}
        image={cfg.shipping.image}
        buttonText={cfg.shipping.buttonText}
        buttonUrl={cfg.shipping.buttonUrl}
      />

      {/* 9. Experiencias de los Usuarios (Testimonios) */}
      <ShowcaseTestimonials
        title={cfg.testimonials.title}
        items={cfg.testimonials.items}
      />
    </div>
  );
};
