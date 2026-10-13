// Configuración editable del nuevo Home estilo "Digital Fundas" (catálogo Wix).
// Se guarda dentro de storeSettings.showcase (persistido en Neon vía extra_data).

export interface ShowcaseBanner {
  id: string;
  title: string;
  text: string;
  extraText?: string;
  image: string;
  buttonText: string;
  buttonAction: 'catalogo' | 'categoria' | 'whatsapp' | 'url' | 'producto';
  buttonTarget?: string; // categoría, url o id de producto
  layout: 'left' | 'right'; // lado de la imagen
}

export interface ShowcaseCard {
  id: string;
  title: string;
  text: string;
  image: string;
  badge: string;
}

export interface ShowcaseStep {
  id: string;
  title: string;
  text: string;
}

export interface ShowcaseTestimonial {
  id: string;
  name: string;
  text: string;
}

export interface ShowcaseSettings {
  theme: { bg: string; surface: string; text: string; muted: string; accent: string };
  animations: boolean;
  models: { title: string; subtitle: string; productIds: string[]; buttonText: string; maxItems: number };
  banners: ShowcaseBanner[];
  maintenance: { kicker: string; title: string; cards: ShowcaseCard[] };
  manufacturers: {
    title: string;
    text: string;
    image: string;
    orderTitle: string;
    orderKicker: string;
    orderText: string;
    steps: ShowcaseStep[];
  };
  shipping: { title: string; text: string; image: string; buttonText: string; buttonUrl: string };
  testimonials: { title: string; items: ShowcaseTestimonial[] };
}

const W = '/wix/';

export const DEFAULT_SHOWCASE: ShowcaseSettings = {
  theme: { bg: '#000000', surface: '#111111', text: '#ffffff', muted: '#a3a3a3', accent: '#e53935' },
  animations: true,
  models: {
    title: 'MODELOS CON AJUSTE PERFECTO',
    subtitle: '',
    productIds: [
      'wix-kit-bondeado',
      'wix-kit-cuero-sin-lumbar',
      'wix-kit-cuero-con-lumbar',
      'wix-2-butacas-bondeado',
      'wix-combo-bondeado',
      'wix-combo-cuero-sin-lumbar',
      'wix-combo-cuero-con-lumbar',
      'wix-funda-mascotas',
      'wix-protector-universal',
    ],
    buttonText: '+comprar',
    maxItems: 12,
  },
  banners: [
    {
      id: 'bn-alfombras',
      title: 'ALFOMBRAS DE GOMA',
      text: 'Alfombras de goma de alta protección, resistentes al barro, agua y desgaste diario. Mantienen el interior limpio y cuidan la alfombra original de tu auto.',
      image: W + '06619e_5f0abb0524284bd9932cd2de24accfc8.jpg',
      buttonText: 'Comprar ahora',
      buttonAction: 'catalogo',
      layout: 'right',
    },
    {
      id: 'bn-volante',
      title: 'CUBRE VOLANTE',
      text: 'Esta línea de accesorios está pensada para el profesional que busca el mejor tacto. Elaborados con materiales nobles y costuras reforzadas, aseguran un manejo firme en cada tramo del camino.',
      extraText: 'Combinación perfecta para cualquier interior de cabina.',
      image: W + '06619e_379b235f36af4c6cb514c54652e9e80b.jpg',
      buttonText: 'Comprar ahora',
      buttonAction: 'catalogo',
      layout: 'left',
    },
    {
      id: 'bn-lumbar',
      title: 'CUERO CON APOYO LUMBAR',
      text: 'Potenciá tu confort con nuestra exclusiva funda de eco cuero microperforado. Incluye apoyo lumbar ergonómico ideal para viajes largos, brindando una experiencia única mientras protegés el tapizado original con estilo.',
      image: W + '06619e_74de07c90ec642d19349a34a6df52053.jpg',
      buttonText: 'Comprar ahora',
      buttonAction: 'producto',
      buttonTarget: 'wix-kit-cuero-con-lumbar',
      layout: 'right',
    },
  ],
  maintenance: {
    kicker: 'Mantenimiento Pro',
    title: 'Mantenimiento Pro',
    cards: [
      { id: 'mc-1', title: 'Limpiador Profundo', text: 'Solución técnica ultra potente formulada para remover impurezas extremas del trayecto sin alterar el brillo.', image: W + '06619e_3156c727e77b4cf897af25c1fb7b5645.jpg', badge: 'Próximamente' },
      { id: 'mc-2', title: 'Brillo de Gomas Premium', text: 'Recupera la estética original de tus neumáticos con un acabado hidrofóbico que evita la suciedad.', image: W + '06619e_4208d341aa1047d5b77d223affa578c4.jpg', badge: 'Próximamente' },
      { id: 'mc-3', title: 'Sellador Pro Gloss', text: 'Blindaje efectivo contra el desgaste del sol y el clima. Terminación espejada de larga vida.', image: W + '06619e_583ed49a8e424e54bbc2e6ebdea41a66.jpg', badge: 'Próximamente' },
    ],
  },
  manufacturers: {
    title: 'SOMOS FABRICANTES',
    text: 'Somos fabricantes especializados en fundas a medida, con ventas por mayor y menor a todo el país.',
    image: W + '06619e_fc6ceea126a3449e8de0089710b8bdc4.jpg',
    orderKicker: 'Tu Pedido',
    orderTitle: 'DETALLES',
    orderText: 'Escribinos al 1138475288 hoy mismo',
    steps: [
      { id: 'st-1', title: 'CONFIGURACIÓN', text: 'Elige el diseño ideal y los materiales que mejor protejan tu inversión diaria.' },
      { id: 'st-2', title: 'ARMADO', text: 'Nuestros expertos inician la producción exacta bajo normas de control rigurosas.' },
      { id: 'st-3', title: 'VIAJE', text: 'Despacho inmediato a cualquier punto del mapa con seguimiento garantizado.' },
    ],
  },
  shipping: {
    title: 'Envíos a todo el país',
    text: 'Realizamos nuestros envíos a través de Andreani, con entrega a domicilio en todo el país y seguimiento en cada etapa del envío.',
    image: W + '06619e_6cd28463b445455497390d872c1cd0f2.jpg',
    buttonText: 'Más info',
    buttonUrl: '',
  },
  testimonials: {
    title: 'Experiencias de los usuarios',
    items: [
      { id: 'ts-1', name: 'Ricardo Méndez', text: 'El material es de otro nivel. Protege todo el interior y se limpia simplemente con un trapo.' },
      { id: 'ts-2', name: 'Esteban F. Ruiz', text: 'Gran gestión, me despejaron dudas al 1138475288 y el paquete llegó antes a Rosario.' },
      { id: 'ts-3', name: 'Lucas G. Vitale', text: 'Se nota la robustez de las costuras. Calzan justo y le dan otra cara al vehículo.' },
    ],
  },
};

/** Mezcla lo guardado con los defaults (para campos nuevos que no existían). */
export function resolveShowcase(saved?: Partial<ShowcaseSettings> | null): ShowcaseSettings {
  const s = (saved || {}) as Partial<ShowcaseSettings>;
  const d = DEFAULT_SHOWCASE;
  return {
    theme: { ...d.theme, ...(s.theme || {}) },
    animations: s.animations ?? d.animations,
    models: { ...d.models, ...(s.models || {}) },
    banners: Array.isArray(s.banners) ? s.banners : d.banners,
    maintenance: { ...d.maintenance, ...(s.maintenance || {}) },
    manufacturers: { ...d.manufacturers, ...(s.manufacturers || {}) },
    shipping: { ...d.shipping, ...(s.shipping || {}) },
    testimonials: { ...d.testimonials, ...(s.testimonials || {}) },
  };
}

export const SHOWCASE_SECTION_IDS = [
  'destacado_wix',
  'modelos',
  'banners',
  'mantenimiento',
  'fabricantes',
  'envios',
  'testimonios',
] as const;

export const SHOWCASE_SECTION_LABELS: Record<string, { title: string; subtitle: string }> = {
  destacado_wix: { title: 'Producto Destacado Interactivo (Wix)', subtitle: 'Selector de colores, miniaturas verticales y compra rápida' },
  modelos: { title: 'Modelos con ajuste perfecto', subtitle: 'Grilla de productos destacados (estilo catálogo)' },
  banners: { title: 'Banners de categorías', subtitle: 'Alfombras, cubre volante, apoyo lumbar...' },
  mantenimiento: { title: 'Mantenimiento Pro', subtitle: 'Tarjetas de productos próximamente' },
  fabricantes: { title: 'Somos fabricantes', subtitle: 'Bloque institucional + pasos del pedido' },
  envios: { title: 'Envíos a todo el país', subtitle: 'Información de envíos (Andreani)' },
  testimonios: { title: 'Experiencias de los usuarios', subtitle: 'Testimonios de clientes' },
};

type Sec = { id: string; title: string; subtitle?: string; visible: boolean };

/**
 * Si las secciones guardadas no incluyen las nuevas secciones del Home, arma
 * el orden del catálogo Wix y deja las secciones anteriores disponibles.
 */
export function mergeHomeSections(saved: Sec[] | undefined | null): Sec[] {
  const list = Array.isArray(saved) ? saved.filter(Boolean) : [];
  const hasShowcase = list.some((s) => (SHOWCASE_SECTION_IDS as readonly string[]).includes(s.id));
  const mk = (id: string, visible = true): Sec => ({
    id,
    title: SHOWCASE_SECTION_LABELS[id]?.title || id,
    subtitle: SHOWCASE_SECTION_LABELS[id]?.subtitle || '',
    visible,
  });

  if (!hasShowcase) {
    const old = list.length
      ? list
      : [
          { id: 'productos', title: 'Colección & Catálogo Principal', visible: true },
          { id: 'alfombras', title: 'Sección Nosotros', visible: true },
          { id: 'resenas', title: 'Opiniones Reales de Clientes', visible: true },
          { id: 'contacto', title: 'Datos de contacto de la tienda', visible: true },
        ];
    const contacto = old.find((s) => s.id === 'contacto');
    const others = old.filter((s) => s.id !== 'contacto').map((s) => ({ ...s, visible: false }));
    return [
      mk('destacado_wix'),
      mk('modelos'),
      mk('banners'),
      mk('mantenimiento'),
      mk('fabricantes'),
      mk('envios'),
      mk('testimonios'),
      ...(contacto ? [{ ...contacto, visible: true }] : []),
      ...others,
    ];
  }
  // Agrega cualquier sección nueva faltante al final
  const missing = SHOWCASE_SECTION_IDS.filter((id) => !list.some((s) => s.id === id)).map((id) => mk(id));
  return [...list, ...missing];
}
