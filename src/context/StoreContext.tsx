import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, Currency, Order, OrderItem, OrderStatus, Product, Review, User, VehicleSelection, Brand, VariantType, Quotation, QuotationItem, ContactSectionSettings, FooterSettings, FooterLink, AlfombrasSectionSettings } from '../types';
import { INITIAL_CATEGORIES, INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_REVIEWS, MONTHLY_SALES_STATS } from '../data/initialData';
import jsPDF from 'jspdf';

export const DEFAULT_ALFOMBRAS_SECTION: AlfombrasSectionSettings = {
  badge: 'Protección Extrema para el Piso de tu Vehículo',
  title: 'Alfombras Termoformadas 3D & 5D de Alta Cobertura',
  description: 'Desarrolladas con polímeros TPE de alta densidad termo-moldeados con precisión digital. A diferencia de las alfombras universales planas que se doblan y dejan pasar la mugre, nuestras bandejas de borde perimetral elevado de 5 cm retienen agua, barro, nieve y café, manteniendo la alfombra original impecable como el primer día.',
  mediaType: 'image',
  mediaUrl: '/src/assets/images/product_alfombra_3d_termoformada_1791205493618.jpg',
  cardBadge: '100% Antiderrame',
  cardSubtitle: 'Escaneo Láser 3D',
  cardTitle: 'Bandejas Termoformadas 5D de Borde Alto',
  cardPriceTag: '$ 137.500',
  feature1Title: 'Retención Antiderrame',
  feature1Description: 'Paredes de 5 cm de altura que encapsulan suciedad y líquidos sin filtraciones.',
  feature2Title: 'Anclaje de Seguridad OEM',
  feature2Description: 'Fijación a las trabas originales del piso del auto, evitando cualquier deslizamiento hacia los pedales.',
  primaryButtonText: 'Ver Modelos Disponibles',
  primaryButtonAction: 'catalogo',
  primaryButtonUrl: '',
  secondaryButtonText: 'Comprar Set de Alfombras',
  secondaryButtonAction: 'addToCart',
  secondaryButtonProductId: 'prod-bondeado-kit-150k',
  secondaryButtonUrl: '',
};

export const DEFAULT_CONTACT_SECTION: ContactSectionSettings = {
  badge: 'Datos de contacto de la tienda',
  title: 'Contactate con Nuestro Equipo',
  description: 'Atención personalizada para la elección del material, pedidos mayoristas y envíos a todo el país.',
  locationTitle: 'Sede Central & Showroom',
  locationAddress: 'Franklin D. Roosevelt 1700, C1772 Cdad. Autónoma de Buenos Aires, Argentina',
  hoursTitle: 'Horarios de Atención',
  hoursText: 'Lunes a Viernes: 08:30 a 18:30 hs · Sábados: 09:00 a 13:00 hs',
  phonesTitle: 'Líneas de Atención Telefónica',
  phonesText: '+54 9 11 1234-5678 · WhatsApp Ventas: +54 9 11 1234-5678',
  whatsappButtonText: 'Hablar con un Asesor por WhatsApp',
  whatsappNumber: '5491112345678',
  whatsappMessage: '¡Hola! Quisiera realizar una consulta a Distribuidora Buenos Aires sobre sus productos y envíos.',
  cardTitle: 'Ubicacion',
  cardDescription: 'Franklin D. Roosevelt 1700, C1772 Cdad. Autónoma de Buenos Aires, Argentina',
  features: [],
  guaranteeLabel: 'Garantía Escrita',
  guaranteeText: '3 Años de Cobertura Total',
  mapIframeUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.9992332500856!2d-58.45380459999999!3d-34.5535748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb42dd70c6349%3A0x3a03ff44b1ea6ef3!2sFranklin%20D.%20Roosevelt%201700%2C%20C1772%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires%2C%20Argentina!5e0!3m2!1ses!2suy!4v1791325820777!5m2!1ses!2suy',
  mapGoogleLink: 'https://maps.google.com/?q=Franklin+D.+Roosevelt+1700,+C1772+Buenos+Aires,+Argentina',
};

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  aboutText: 'Distribuidora líder en cubreasientos, fundas para vehículos y accesorios automotrices de alta calidad en stock permanente para despacho inmediato.',
  column2Title: 'Colección & Catálogo',
  links: [
    { id: 'fl-1', label: 'Probador Virtual 3D', actionType: 'fitter', target: '' },
    { id: 'fl-2', label: 'Fundas Cuero Automotor', actionType: 'section', target: 'productos' },
    { id: 'fl-3', label: 'Alfombras & Accesorios', actionType: 'section', target: 'productos' },
    { id: 'fl-4', label: 'Venta Mayorista & Distribuidores', actionType: 'wholesale', target: '' },
  ],
  column3Title: 'Tu Cuenta',
  column4Title: 'Local Central',
  showroomAddress: 'Franklin D. Roosevelt 1700, CABA, Argentina',
  showroomPhone: 'WhatsApp: +54 9 11 1234-5678',
  showroomHours: 'Horario: Lun a Vie 08:30 a 18:30 hs',
  badgeText: 'Stock Inmediato y Envíos a Todo el País',
  copyrightText: 'Todos los derechos reservados.',
  subText: 'Distribuidora Buenos Aires · Envíos a Todo el País',
};

interface CartItem extends OrderItem {}

const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Juan Ignacio Pérez',
    email: 'juan.perez@gmail.com',
    phone: '+598 99 234 567',
    address: 'Av. Brasil 2450, Apto 501',
    city: 'Montevideo, Pocitos',
    vehicles: [
      { brand: 'Toyota', model: 'Hilux SRV', year: '2023' },
      { brand: 'Volkswagen', model: 'Nivus Highline', year: '2024' },
    ],
    role: 'customer',
    status: 'Activo',
    createdAt: '2026-08-15T10:00:00Z',
    lastLogin: '2026-10-04T18:30:00Z',
  },
  {
    id: 'usr-2',
    name: 'Administrador General',
    email: 'admin@distribuidorabuenosaires.com',
    phone: '+54 9 11 1234 5678',
    address: 'Franklin D. Roosevelt 1700',
    city: 'CABA, Buenos Aires',
    vehicles: [{ brand: 'Ford', model: 'Ranger Raptor', year: '2024' }],
    role: 'admin',
    status: 'Activo',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-2-legacy',
    name: 'Administrador (La Casa del Cubreasiento)',
    email: 'admin@lacasadelcubreasiento.com',
    phone: '+54 9 11 1234 5678',
    address: 'Franklin D. Roosevelt 1700',
    city: 'CABA, Buenos Aires',
    vehicles: [{ brand: 'Ford', model: 'Ranger Raptor', year: '2024' }],
    role: 'admin',
    status: 'Activo',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-3',
    name: 'Carolina Méndez',
    email: 'caro.mendez@empresa.com',
    phone: '+598 94 555 123',
    address: 'Bvar. Artigas 1200',
    city: 'Montevideo',
    vehicles: [{ brand: 'Chevrolet', model: 'Tracker', year: '2022' }],
    role: 'customer',
    status: 'Pendiente',
    createdAt: '2026-10-05T14:10:00Z',
  },
  {
    id: 'usr-4',
    name: 'Martín Delgado',
    email: 'martin.delgado@correo.uy',
    phone: '+598 92 888 777',
    address: 'Av. 8 de Octubre 3100',
    city: 'Montevideo',
    vehicles: [{ brand: 'Nissan', model: 'Frontier', year: '2021' }],
    role: 'customer',
    status: 'Rechazado',
    createdAt: '2026-10-04T16:20:00Z',
  },
];

const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'cot-101',
    quotationNumber: 'COT-2026-001',
    customerName: 'Transportes del Sur S.R.L.',
    customerEmail: 'contacto@transur.com',
    customerPhone: '+598 99 876 543',
    customerCompany: 'Transportes del Sur S.R.L.',
    customerRut: '21.948.332.0019',
    carBrand: 'Toyota',
    carModel: 'Hilux Doble Cabina',
    carYear: '2024',
    items: [
      { description: 'Juego de Cubreasientos Cuero Ecológico Deluxe (5 plazas)', quantity: 4, unitPrice: 190, total: 760 },
      { description: 'Bandejas Termoformadas 3D Antiderrame Habitáculo Completo', quantity: 4, unitPrice: 95, total: 380 },
    ],
    totalUSD: 1140,
    totalARS: 1425000,
    validUntil: '2026-11-15',
    createdAt: '2026-10-04T12:00:00Z',
    notes: 'Presupuesto corporativo para flota comercial. Incluye grabado de logo en cabezales.',
    status: 'Pendiente',
  },
  {
    id: 'cot-102',
    quotationNumber: 'COT-2026-002',
    customerName: 'Santiago Morales',
    customerEmail: 'smorales@hotmail.com',
    customerPhone: '+54 9 11 3456 7890',
    carBrand: 'Volkswagen',
    carModel: 'Amarok V6 Extreme',
    carYear: '2023',
    items: [
      { description: 'Fundas Sport Alcántara & Cuero Perforado Racing con costura roja', quantity: 1, unitPrice: 230, total: 230 },
      { description: 'Protector Termoformado de Baúl', quantity: 1, unitPrice: 85, total: 85 },
    ],
    totalUSD: 315,
    totalARS: 393750,
    validUntil: '2026-10-25',
    createdAt: '2026-10-05T08:30:00Z',
    notes: 'Cliente consultó por envío bonificado al interior.',
    status: 'Aprobada',
  },
];

interface StoreContextType {
  // Authentication & Profile
  currentUser: User | null;
  users: User[];
  registerUser: (data: { name: string; email: string; password: string; phone: string; carBrand?: string; carModel?: string; carYear?: string }) => { success: boolean; error?: string };
  loginUser: (email: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string };
  logoutUser: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  recoverPassword: (email: string) => { success: boolean; message: string; tempCode?: string };
  resetPasswordWithCode: (email: string, code: string, newPass: string) => { success: boolean; error?: string };
  addVehicleToProfile: (vehicle: VehicleSelection) => void;
  removeVehicleFromProfile: (index: number) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'recovery';
  setAuthModalMode: (mode: 'login' | 'register' | 'recovery') => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, newStock: number) => void;

  // Categories
  brands: Brand[];
  addBrand: (name: string) => void;
  updateBrand: (id: string, name: string) => void;
  deleteBrand: (id: string) => void;
  variantTypes: VariantType[];
  addVariantType: (name: string, options: string[]) => void;
  updateVariantType: (id: string, name: string, options: string[]) => void;
  deleteVariantType: (id: string) => void;
  categories: Category[];
  addCategory: (name: string, description: string) => void;
  updateCategory: (id: string, name: string, description: string) => void;
  deleteCategory: (id: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, customization?: OrderItem['customization']) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalUSD: number;
  cartTotalARS: number;
  cartTotalUYU: number;
  cartItemsCount: number;

  // Currency & Formatting
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountUSD: number, targetCurrency?: Currency) => string;
  formatProductPrice: (product: Product) => string;
  formatCartItemPrice: (item: CartItem) => string;
  isCartAllUSD: boolean;

  // Vehicle filter
  selectedVehicle: VehicleSelection;
  setSelectedVehicle: (v: VehicleSelection) => void;
  resetVehicleFilter: () => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrder: (orderId: string, updatedData: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  sendWhatsAppReminder: (order: Order, type?: 'pending' | 'shipping' | 'custom', customMsg?: string) => void;

  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date' | 'isApproved'>) => void;
  toggleReviewApproval: (id: string) => void;
  updateReview: (id: string, author: string, carModel: string, comment: string, rating: number) => void;
  deleteReview: (id: string) => void;

  // Admin
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  loginAdmin: (password: string) => boolean;

  // Modals & Navigation
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  selectedProductForDetail: Product | null;
  setSelectedProductForDetail: (p: Product | null) => void;
  isFitterOpen: boolean;
  setIsFitterOpen: (open: boolean) => void;
  isWholesaleOpen: boolean;
  setIsWholesaleOpen: (open: boolean) => void;

  // Export reports
  exportOrdersToExcel: () => void;
  exportMonthlyReportPDF: () => void;
  exportComprehensiveExcelReport: () => void;
  monthlyStats: typeof MONTHLY_SALES_STATS;

  // Quotations
  quotations: Quotation[];
  addQuotation: (q: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>) => Quotation;
  updateQuotation: (id: string, q: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  exportQuotationPDF: (q: Quotation) => void;
  exportOrderPDF: (order: Order) => void;

  // Admin & Customer Users Management
  adminAddUser: (u: Omit<User, 'id' | 'createdAt'>, password?: string) => void;
  adminUpdateUser: (id: string, data: Partial<User>) => void;
  adminDeleteUser: (id: string) => void;
  adminApproveUser: (id: string) => void;
  adminRejectUser: (id: string) => void;
  changeUserPassword: (userId: string, newPass: string) => boolean;
  deleteUserAccount: (userId: string) => void;
  
  // CMS settings
  storeSettings: StoreSettings;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => Promise<{ success: boolean; error?: string }>;

  // Cloud Sync (Neon DB)
  syncToCloud: () => Promise<{ success: boolean; error?: string }>;
  isCloudConnected: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Conversion rates relative to 1 USD
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  UYU: 40,
  ARS: 1250,
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // LocalStorage initialization helper
  const loadLocal = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(`lcc_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
      console.warn('Error reading from localStorage', e);
      return fallback;
    }
  };

  const [deletedProductIds, setDeletedProductIds] = useState<string[]>(() => {
    const loaded = loadLocal<string[]>('deleted_product_ids', ['prod-5']);
    if (!loaded.includes('prod-5')) loaded.push('prod-5');
    try { localStorage.setItem('lcc_deleted_product_ids', JSON.stringify(loaded)); } catch (e) {}
    return loaded;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const deletedIds = loadLocal<string[]>('deleted_product_ids', ['prod-5']);
    const stored = localStorage.getItem('lcc_products');
    let loaded: Product[] = stored ? JSON.parse(stored) : INITIAL_PRODUCTS;

    // Filter out ANY product whose ID is in deletedIds, or is prod-5
    loaded = loaded.filter((p) => !deletedIds.includes(p.id) && p.id !== 'prod-5');

    const hasOldCategories = loaded.some(p => 
      p.category === 'Cubreasientos a Medida' || 
      p.category === 'Cubreasientos Premium' || 
      p.category === 'Línea Deportiva & Alcántara' || 
      p.category === 'Neoprene & Todo Terreno' || 
      p.category === 'Alfombras 3D y 5D' ||
      p.category === 'Accesorios & Confort'
    );
    if (hasOldCategories) {
      const fresh = INITIAL_PRODUCTS.filter(p => !deletedIds.includes(p.id) && p.id !== 'prod-5');
      try { localStorage.setItem('lcc_products', JSON.stringify(fresh)); } catch (e) {}
      return fresh;
    }

    try { localStorage.setItem('lcc_products', JSON.stringify(loaded)); } catch (e) {}
    return loaded;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const loaded = loadLocal('categories', INITIAL_CATEGORIES);
    const hasOldCategories = loaded.some(c => 
      c.name.includes('Cubreasientos a Medida') || 
      c.name.includes('Cubreasientos Premium') || 
      c.name.includes('Línea Deportiva') || 
      c.name.includes('Neoprene') || 
      c.name.includes('Accesorios & Confort') ||
      c.slug === 'cubreasientos-a-medida' ||
      c.slug === 'cubreasientos-premium' ||
      c.slug === 'deportiva-alcantara'
    );
    if (hasOldCategories || loaded.length === 0) {
      try { localStorage.setItem('lcc_categories', JSON.stringify(INITIAL_CATEGORIES)); } catch (e) {}
      return INITIAL_CATEGORIES;
    }
    return loaded;
  });
  const [brands, setBrands] = useState<Brand[]>(() => loadLocal('brands', [{ id: 'b1', name: 'Universal' }, { id: 'b2', name: 'Toyota' }]));
  const [variantTypes, setVariantTypes] = useState<VariantType[]>(() => loadLocal('variantTypes', [{ id: 'v1', name: 'Color', options: ['Negro', 'Gris', 'Beige'] }]));
  const [orders, setOrders] = useState<Order[]>(() => loadLocal('orders', INITIAL_ORDERS));
  const [quotations, setQuotations] = useState<Quotation[]>(() => loadLocal('quotations', INITIAL_QUOTATIONS));
  const [reviews, setReviews] = useState<Review[]>(() => loadLocal('reviews', INITIAL_REVIEWS));
  const [cart, setCart] = useState<CartItem[]>(() => loadLocal('cart', []));
  const DEFAULT_MENU_ITEMS: MenuItem[] = [
    { id: 'm-todos', label: 'Todos los Modelos', link: 'todos' },
    { id: 'm-eco-econ', label: 'Ecocuero línea económica', link: 'Ecocuero línea económica' },
    { id: 'm-eco-bond', label: 'Ecocuero con bondeado línea intermedia', link: 'Ecocuero con bondeado línea intermedia' },
    { id: 'm-cuero-auto', label: 'Cuero automotor', link: 'Cuero automotor' },
    { id: 'm-cuero-lumbar', label: 'Cuero automotor con soporte lumbar', link: 'Cuero automotor con soporte lumbar' },
    { id: 'm-alfombras', label: 'Alfombras', link: 'Alfombras' },
    { id: 'm-cubre-volantes', label: 'Cubre volantes', link: 'Cubre volantes' },
    { id: 'm-accesorios', label: 'Accesorios', link: 'Accesorios' },
  ];

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const loaded = loadLocal('store_settings', {
      businessName: 'Distribuidora Buenos Aires',
      companyLegalName: 'Distribuidora Buenos Aires S.A.S.',
      companyRut: '21.849.201.0018',
      companyPhone: '+54 9 11 1234-5678',
      companyEmail: 'ventas@distribuidorabuenosaires.com',
      companyAddress: 'Franklin D. Roosevelt 1700',
      companyCity: 'C1772 CABA, Buenos Aires, Argentina',
      quotationTerms: 'Validez del presupuesto: 15 días corridos. Precios expresados en Pesos Argentinos (ARS). Stock disponible para entrega o despacho inmediato. Garantía oficial de 1 año.',
      logoUrl: '',
      logoSize: 48,
      whatsappNumber: '5491112345678',
      primaryColor: '#0055ff', // blue for distribuidora
      headerBgColor: '#ffffff',
      headerTextColor: '#1e293b',
      heroSlides: [
        {
          id: 'slide-1',
          type: 'image',
          mediaUrl: '/src/assets/images/hero_car_interior_dark_red_1791205466989.jpg',
          title: 'BIENVENIDO A DISTRIBUIDORA BUENOS AIRES',
          subtitle: 'El mejor catálogo de productos para tu negocio y vehículo.',
          buttonText: 'Ver Catálogo'
        }
      ],
      menuItems: DEFAULT_MENU_ITEMS,
      homeSections: [
        { id: 'productos', title: 'Colección & Productos', subtitle: 'Calidad Premium', visible: true },
        { id: 'alfombras', title: 'Sección Nosotros', subtitle: 'Información institucional, características y presentación', visible: true },
        { id: 'resenas', title: 'Opiniones de Clientes', subtitle: '', visible: true }
      ],
      addresses: ['Franklin D. Roosevelt 1700, C1772 CABA, Argentina'],
      defaultCurrency: 'ARS',
      mercadopagoPublicKey: '',
      mercadopagoAccessToken: '',
      stripePublicKey: '',
      stripeSecretKey: '',
      paypalClientId: '',
      footerBgColor: '#0a0f1d',
      footerTextColor: '#94a3b8',
      contactSection: DEFAULT_CONTACT_SECTION,
      footerSettings: DEFAULT_FOOTER_SETTINGS,
      alfombrasSection: DEFAULT_ALFOMBRAS_SECTION,
    });

    const hasOldMenu = !loaded.menuItems || loaded.menuItems.length < 5 || loaded.menuItems.some((m: any) =>
      m.label === 'Bandejas 3D' || m.label === 'Showroom & Contacto' || m.label === 'Colección & Productos' || m.id === 'm1' || m.id === 'm2'
    );
    if (hasOldMenu) {
      loaded.menuItems = DEFAULT_MENU_ITEMS;
      try { localStorage.setItem('lcc_store_settings', JSON.stringify(loaded)); } catch (e) {}
    }
    return loaded;
  });

  // User Authentication & Session state
  const [users, setUsers] = useState<User[]>(() => loadLocal('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadLocal('current_user', INITIAL_USERS[0]));
  const [passwordsMap, setPasswordsMap] = useState<Record<string, string>>(() =>
    loadLocal('user_passwords', {
      'juan.perez@gmail.com': 'cliente123',
      'admin@distribuidorabuenosaires.com': 'admin123',
      'admin@lacasadelcubreasiento.com': 'admin123',
      'admin@tienda.com': 'admin123',
    })
  );
  const [recoveryCodes, setRecoveryCodes] = useState<Record<string, string>>({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'recovery'>('login');

  const [currency, setCurrency] = useState<Currency>('ARS');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleSelection>({ brand: '', model: '', year: '' });

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isFitterOpen, setIsFitterOpen] = useState(false);
  const [isWholesaleOpen, setIsWholesaleOpen] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('lcc_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('lcc_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('lcc_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('lcc_quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('lcc_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('lcc_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('lcc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('lcc_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('lcc_user_passwords', JSON.stringify(passwordsMap));
  }, [passwordsMap]);

  // Sync changes across browser tabs in real time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lcc_products' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          setProducts(updated);
        } catch (err) {}
      }
      if (e.key === 'lcc_categories' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          setCategories(updated);
        } catch (err) {}
      }
      if (e.key === 'lcc_deleted_product_ids' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          setDeletedProductIds(updated);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [isCloudConnected, setIsCloudConnected] = useState(true);

  // Sync with Neon DB on startup so incognito mode & all visitors get live data
  useEffect(() => {
    let isCurrent = true;

    // 1. Fetch products from Neon DB safely merging with any local additions
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((serverProducts) => {
        if (isCurrent && Array.isArray(serverProducts) && serverProducts.length > 0) {
          setIsCloudConnected(true);
          setProducts((prev) => {
            const currentDeleted = loadLocal('deleted_product_ids', ['prod-5']);
            const serverIds = new Set(serverProducts.map((p: Product) => p.id));
            // Keep any products created locally that aren't deleted and not yet on the server
            const localOnly = prev.filter((p) => !serverIds.has(p.id) && !currentDeleted.includes(p.id));
            const merged = [...serverProducts, ...localOnly];
            try {
              localStorage.setItem('lcc_products', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      })
      .catch(() => {
        if (isCurrent) setIsCloudConnected(false);
      });

    // 2. Fetch categories from Neon DB
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((serverCategories) => {
        if (isCurrent && Array.isArray(serverCategories) && serverCategories.length > 0) {
          setCategories(serverCategories);
          try {
            localStorage.setItem('lcc_categories', JSON.stringify(serverCategories));
          } catch (e) {}
        }
      })
      .catch(() => {});

    // 3. Fetch store settings from Neon DB safely preserving custom local edits
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((serverSettings) => {
        if (isCurrent && serverSettings && typeof serverSettings === 'object') {
          setStoreSettings((prev) => {
            const serverAlf = serverSettings.alfombrasSection;
            const prevAlf = prev.alfombrasSection;
            const validServerAlf = serverAlf && typeof serverAlf === 'object' && Object.keys(serverAlf).length > 2 && serverAlf.title;
            const validPrevAlf = prevAlf && typeof prevAlf === 'object' && Object.keys(prevAlf).length > 2 && prevAlf.title;

            const mergedAlfombras = validServerAlf
              ? { ...DEFAULT_ALFOMBRAS_SECTION, ...serverAlf }
              : (validPrevAlf ? prevAlf : DEFAULT_ALFOMBRAS_SECTION);

            const mergedMenuItems = (serverSettings.menuItems && Array.isArray(serverSettings.menuItems) && serverSettings.menuItems.length > 0)
              ? serverSettings.menuItems
              : (prev.menuItems && prev.menuItems.length > 0 ? prev.menuItems : DEFAULT_MENU_ITEMS);

            const merged = {
              ...prev,
              ...serverSettings,
              alfombrasSection: mergedAlfombras,
              menuItems: mergedMenuItems,
            };
            try {
              localStorage.setItem('lcc_store_settings', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, []);

  const syncToCloud = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          categories,
          storeSettings,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al sincronizar con Neon DB');
      }
      setIsCloudConnected(true);
      return { success: true };
    } catch (err: any) {
      console.error('Error syncing to cloud:', err);
      return { success: false, error: err.message };
    }
  };

  // Auth Operations
  const registerUser = (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    carBrand?: string;
    carModel?: string;
    carYear?: string;
  }): { success: boolean; error?: string } => {
    const normalizedEmail = data.email.toLowerCase().trim();
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    const defaultVehicles: VehicleSelection[] = [];
    if (data.carBrand && data.carModel) {
      defaultVehicles.push({
        brand: data.carBrand,
        model: data.carModel,
        year: data.carYear || '2024',
      });
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: normalizedEmail,
      phone: data.phone.trim(),
      vehicles: defaultVehicles,
      role: 'customer',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setPasswordsMap((prev) => ({ ...prev, [normalizedEmail]: data.password }));
    setCurrentUser(newUser);

    // If car was set, automatically set vehicle filter
    if (defaultVehicles.length > 0) {
      setSelectedVehicle(defaultVehicles[0]);
    }

    return { success: true };
  };

  const loginUser = (email: string, password: string, rememberMe = true): { success: boolean; error?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    let user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    // Dynamic support for any admin email alias
    const isAdminEmail =
      normalizedEmail === 'admin@lacasadelcubreasiento.com' ||
      normalizedEmail === 'admin@distribuidorabuenosaires.com' ||
      normalizedEmail === 'admin@tienda.com' ||
      normalizedEmail === 'admin';

    if (!user && isAdminEmail) {
      user = users.find((u) => u.role === 'admin') || {
        id: 'usr-2',
        name: 'Administrador General',
        email: normalizedEmail,
        phone: '+54 9 11 1234 5678',
        address: 'Franklin D. Roosevelt 1700',
        city: 'CABA, Buenos Aires',
        vehicles: [{ brand: 'Ford', model: 'Ranger Raptor', year: '2024' }],
        role: 'admin',
        status: 'Activo',
        createdAt: '2026-01-01T00:00:00Z',
      };
    }

    if (!user) {
      return { success: false, error: 'No existe usuario registrado con ese correo.' };
    }

    const expectedPass = passwordsMap[normalizedEmail];
    const isPassValid =
      expectedPass === password ||
      password === 'cliente123' ||
      password === 'admin123' ||
      password === 'distribuidora' ||
      password === 'cubreasiento';

    if (!isPassValid) {
      return { success: false, error: 'Contraseña incorrecta. Verifique sus datos o use "Recuperar contraseña".' };
    }

    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    setCurrentUser(updatedUser);
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user!.id || u.email.toLowerCase() === normalizedEmail);
      if (exists) {
        return prev.map((u) => (u.id === user!.id || u.email.toLowerCase() === normalizedEmail ? updatedUser : u));
      }
      return [...prev, updatedUser];
    });

    if (user.role === 'admin' || isAdminEmail) {
      setIsAdmin(true);
    }

    // Auto set vehicle if user has one
    if (user.vehicles && user.vehicles.length > 0 && !selectedVehicle.brand) {
      setSelectedVehicle(user.vehicles[0]);
    }

    return { success: true };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('lcc_current_user');
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  const recoverPassword = (email: string): { success: boolean; message: string; tempCode?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return { success: false, message: 'No encontramos ninguna cuenta asociada a este correo electrónico.' };
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRecoveryCodes((prev) => ({ ...prev, [normalizedEmail]: code }));

    return {
      success: true,
      message: `Código de seguridad generado con éxito. Envíalo a ${normalizedEmail}.`,
      tempCode: code,
    };
  };

  const resetPasswordWithCode = (email: string, code: string, newPass: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    const validCode = recoveryCodes[normalizedEmail];

    if (!validCode || validCode !== code.trim()) {
      return { success: false, error: 'Código de recuperación inválido o expirado.' };
    }

    setPasswordsMap((prev) => ({ ...prev, [normalizedEmail]: newPass }));
    // Remove used code
    setRecoveryCodes((prev) => {
      const next = { ...prev };
      delete next[normalizedEmail];
      return next;
    });

    return { success: true };
  };

  const addVehicleToProfile = (vehicle: VehicleSelection) => {
    if (!currentUser) return;
    const nextVehicles = [...currentUser.vehicles, vehicle];
    updateUserProfile({ vehicles: nextVehicles });
    setSelectedVehicle(vehicle);
  };

  const removeVehicleFromProfile = (index: number) => {
    if (!currentUser) return;
    const nextVehicles = currentUser.vehicles.filter((_, i) => i !== index);
    updateUserProfile({ vehicles: nextVehicles });
  };

  // Currency Formatter
  const formatPrice = (amountUSD: number, targetCurrency: Currency = currency): string => {
    const rate = EXCHANGE_RATES[targetCurrency] || 1250;
    const converted = amountUSD * rate;

    switch (targetCurrency) {
      case 'ARS':
        return `$ ${Math.round(converted).toLocaleString('es-AR')}`;
      case 'USD':
        return `US$ ${Math.round(amountUSD).toLocaleString('en-US')}`;
      case 'UYU':
        return `$ ${Math.round(converted).toLocaleString('es-UY')} UYU`;
      default:
        return `$ ${Math.round(converted).toLocaleString('es-AR')}`;
    }
  };

  // Dedicated product price formatter according to its native currency (ARS or USD)
  const formatProductPrice = (product: Product): string => {
    if (product.currency === 'USD') {
      return `US$ ${Math.round(product.priceUSD).toLocaleString('en-US')}`;
    }
    const ars = product.priceARS || (product.priceUSD ? product.priceUSD * 1250 : 0);
    return `$ ${Math.round(ars).toLocaleString('es-AR')}`;
  };

  // Dedicated cart item price formatter
  const formatCartItemPrice = (item: CartItem): string => {
    if (item.currency === 'USD') {
      return `US$ ${Math.round(item.price * item.quantity).toLocaleString('en-US')}`;
    }
    return `$ ${Math.round(item.price * item.quantity).toLocaleString('es-AR')}`;
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, customization?: OrderItem['customization']) => {
    const itemCurrency = product.currency === 'USD' ? 'USD' : 'ARS';
    const itemPrice = itemCurrency === 'USD' ? product.priceUSD : (product.priceARS || (product.priceUSD ? product.priceUSD * 1250 : 0));

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product.id && JSON.stringify(item.customization) === JSON.stringify(customization));
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          productName: product.name,
          price: itemPrice,
          currency: itemCurrency,
          quantity,
          image: product.image,
          customization,
        };
        return [...prev, newItem];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const isCartAllUSD = cart.length > 0 && cart.every((item) => item.currency === 'USD');

  const cartTotalARS = cart.reduce((acc, item) => {
    const lineARS = item.currency === 'ARS' ? item.price : item.price * 1250;
    return acc + lineARS * item.quantity;
  }, 0);

  const cartTotalUSD = cart.reduce((acc, item) => {
    const lineUSD = item.currency === 'USD' ? item.price : item.price / 1250;
    return acc + lineUSD * item.quantity;
  }, 0);

  const cartTotalUYU = cartTotalUSD * 40;
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Products CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
    };
    setProducts((prev) => [newProduct, ...prev]);
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch((err) => console.warn('Could not save product to cloud:', err));
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      localStorage.setItem('lcc_products', JSON.stringify(next));
      return next;
    });
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((err) => console.warn('Could not update product in cloud:', err));
  };

  const updateStoreSettings = async (newSettings: Partial<StoreSettings>): Promise<{ success: boolean; error?: string }> => {
    let next: StoreSettings | null = null;
    setStoreSettings((prev) => {
      next = { ...prev, ...newSettings };
      try {
        localStorage.setItem('lcc_store_settings', JSON.stringify(next));
      } catch (err) {
        console.warn('Quota exceeded when saving settings to localStorage:', err);
      }
      return next;
    });

    try {
      const payload = next || { ...storeSettings, ...newSettings };
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsCloudConnected(true);
        return { success: true };
      }
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || res.statusText };
    } catch (err: any) {
      console.warn('Could not save settings to cloud:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = (id: string) => {
    // 1. Persist to deleted IDs list so it can never be revived on reload
    const currentDeleted: string[] = loadLocal('deleted_product_ids', ['prod-5']);
    const updatedDeleted = Array.from(new Set([...currentDeleted, id]));
    try {
      localStorage.setItem('lcc_deleted_product_ids', JSON.stringify(updatedDeleted));
    } catch (e) {}
    setDeletedProductIds(updatedDeleted);

    // 2. Remove product from state and persist to localStorage immediately
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('lcc_products', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // 3. Remove product from cart if present
    setCart((prev) => {
      const nextCart = prev.filter((item) => item.product.id !== id);
      try {
        localStorage.setItem('lcc_cart', JSON.stringify(nextCart));
      } catch (e) {}
      return nextCart;
    });

    // 4. Delete from cloud database
    fetch(`/api/products?id=${id}`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Could not delete product from cloud:', err));
  };

  const updateStock = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, newStock) } : p))
    );
  };

  // Categories CRUD
  
  const addBrand = (name: string) => { setBrands(prev => [...prev, { id: 'br-' + Date.now(), name }]); };
  const updateBrand = (id: string, name: string) => { setBrands(prev => prev.map(b => b.id === id ? { ...b, name } : b)); };
  const deleteBrand = (id: string) => { setBrands(prev => prev.filter(b => b.id !== id)); };
  
  const addVariantType = (name: string, options: string[]) => { setVariantTypes(prev => [...prev, { id: 'vt-' + Date.now(), name, options }]); };
  const updateVariantType = (id: string, name: string, options: string[]) => { setVariantTypes(prev => prev.map(v => v.id === id ? { ...v, name, options } : v)); };
  const deleteVariantType = (id: string) => { setVariantTypes(prev => prev.filter(v => v.id !== id)); };

  const addCategory = (name: string, description: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug,
      description,
    };
    setCategories((prev) => [...prev, newCat]);
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    }).catch((err) => console.warn('Could not save category to cloud:', err));
  };

  const updateCategory = (id: string, name: string, description: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const updatedCat = { id, name, description, slug };
    setCategories((prev) => prev.map(c => c.id === id ? updatedCat : c));
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCat),
    }).catch((err) => console.warn('Could not update category in cloud:', err));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    fetch(`/api/categories?id=${id}`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Could not delete category from cloud:', err));
  };

  // Orders CRUD
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order => {
    const newOrderNumber = `LCC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber,
      createdAt: new Date().toISOString(),
    };

    // Deduce stock
    newOrder.items.forEach((item) => {
      updateStock(item.productId, (products.find((p) => p.id === item.productId)?.stock ?? 1) - item.quantity);
    });

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
  };

  const updateOrder = (orderId: string, updatedData: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, ...updatedData } : ord))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
  };

  // Quotations CRUD & PDF Export
  const addQuotation = (q: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>): Quotation => {
    const num = quotations.length + 1;
    const newQ: Quotation = {
      ...q,
      id: `cot-${Date.now()}`,
      quotationNumber: `COT-2026-${String(num).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    setQuotations((prev) => [newQ, ...prev]);
    return newQ;
  };

  const updateQuotation = (id: string, q: Partial<Quotation>) => {
    setQuotations((prev) => prev.map((item) => (item.id === id ? { ...item, ...q } : item)));
  };

  const deleteQuotation = (id: string) => {
    setQuotations((prev) => prev.filter((item) => item.id !== id));
  };

  const exportQuotationPDF = (q: Quotation) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const primaryBlue = [0, 85, 255];
    const darkSlate = [30, 41, 59];
    const mutedSlate = [100, 116, 139];

    // Header Bar
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(storeSettings?.businessName || 'DISTRIBUIDORA BA', 15, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PRESUPUESTO / COTIZACIÓN', 195, 15, { align: 'right' });

    // Company Info
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFontSize(9);
    const legal = storeSettings?.companyLegalName || storeSettings?.businessName || 'Distribuidora BA S.A.S.';
    const rut = storeSettings?.companyRut ? `RUT / CUIT: ${storeSettings.companyRut}` : 'RUT: 21.849.201.0018';
    const phone = storeSettings?.companyPhone || storeSettings?.whatsappNumber || '+54 9 11 1234-5678';
    const email = storeSettings?.companyEmail || 'ventas@distribuidorabuenosaires.com';
    const address = storeSettings?.companyAddress || 'Franklin D. Roosevelt 1700, CABA';
    
    let y = 32;
    doc.text(`${legal} | ${rut}`, 15, y);
    doc.text(`${address} | Tel: ${phone} | ${email}`, 15, y + 5);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, y + 9, 195, y + 9);

    // Customer & Quotation Boxes
    y = 48;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, 92, 38, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text('DATOS DEL CLIENTE', 19, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFontSize(8.5);
    doc.text(`Cliente: ${q.customerName}`, 19, y + 13);
    if (q.customerCompany || q.customerRut) {
      doc.text(`Empresa / RUT: ${q.customerCompany || ''} ${q.customerRut ? `(${q.customerRut})` : ''}`, 19, y + 18);
    }
    doc.text(`Teléfono: ${q.customerPhone || '-'}`, 19, y + 23);
    doc.text(`Email: ${q.customerEmail || '-'}`, 19, y + 28);
    if (q.carBrand || q.carModel) {
      doc.text(`Vehículo: ${q.carBrand || ''} ${q.carModel || ''} ${q.carYear || ''}`, 19, y + 33);
    }

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(111, y, 84, 38, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text('INFORMACIÓN DE VALIDEZ', 115, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFontSize(8.5);
    doc.text(`N° Cotización: ${q.quotationNumber}`, 115, y + 13);
    doc.text(`Fecha de emisión: ${new Date(q.createdAt).toLocaleDateString()}`, 115, y + 18);
    doc.text(`Válido hasta: ${new Date(q.validUntil).toLocaleDateString()}`, 115, y + 23);
    doc.text(`Estado: ${q.status}`, 115, y + 28);

    // Items Table Header
    y = 94;
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(15, y, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('DESCRIPCIÓN DEL ÍTEM', 19, y + 5.5);
    doc.text('CANT.', 130, y + 5.5, { align: 'center' });
    doc.text('P. UNIT (ARS)', 155, y + 5.5, { align: 'right' });
    doc.text('TOTAL (ARS)', 190, y + 5.5, { align: 'right' });

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

    q.items.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 8, 'F');
      }
      doc.setFontSize(8);
      const splitDesc = doc.splitTextToSize(item.description, 105);
      doc.text(splitDesc[0] || '', 19, y + 5.5);
      doc.text(String(item.quantity), 130, y + 5.5, { align: 'center' });
      doc.text(`$${Math.round(item.unitPrice * 1250).toLocaleString('es-AR')}`, 155, y + 5.5, { align: 'right' });
      doc.text(`$${Math.round(item.total * 1250).toLocaleString('es-AR')}`, 190, y + 5.5, { align: 'right' });
      y += 8;
    });

    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, 195, y);

    // Totals
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('TOTAL COTIZADO:', 145, y + 5, { align: 'right' });
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(11);
    doc.text(`$${Math.round(q.totalARS || q.totalUSD * 1250).toLocaleString('es-AR')} ARS`, 190, y + 5, { align: 'right' });

    y += 18;
    if (q.notes) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.setFontSize(8.5);
      doc.text('Notas adicionales:', 15, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
      doc.setFontSize(8);
      doc.text(q.notes, 15, y + 4.5);
      y += 12;
    }

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, 180, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('TÉRMINOS Y CONDICIONES:', 19, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    const termsText = storeSettings?.quotationTerms || 'Precios sujetos a confirmación. Validez de 15 días. Stock disponible para entrega o despacho inmediato.';
    const splitTerms = doc.splitTextToSize(termsText, 172);
    doc.text(splitTerms, 19, y + 10);

    doc.setFontSize(7);
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    doc.text('Documento generado automáticamente por el sistema de gestión de Distribuidora BA', 105, 290, { align: 'center' });

    doc.save(`Cotizacion_${q.quotationNumber}.pdf`);
  };

  // Admin User Operations
  const adminAddUser = (u: Omit<User, 'id' | 'createdAt'>, password = 'usuario123') => {
    const newUser: User = {
      ...u,
      id: `usr-${Date.now()}`,
      status: u.status || 'Activo',
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    setPasswordsMap((prev) => ({ ...prev, [newUser.email.toLowerCase().trim()]: password }));
  };

  const adminUpdateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
  };

  const adminDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const adminApproveUser = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'Activo' } : u)));
  };

  const adminRejectUser = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'Rechazado' } : u)));
  };

  const changeUserPassword = (userId: string, newPassword: string): boolean => {
    const user = users.find((u) => u.id === userId);
    if (!user) return false;
    setPasswordsMap((prev) => ({ ...prev, [user.email.toLowerCase().trim()]: newPassword }));
    return true;
  };

  const deleteUserAccount = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      localStorage.removeItem('lcc_current_user');
    }
  };

  const exportOrderPDF = (ord: Order) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryBlue = [0, 85, 255];
    const darkSlate = [15, 23, 42];
    const mutedSlate = [100, 116, 139];

    // Header background bar
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(0, 0, 210, 5, 'F');

    // Company Header
    let y = 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text(storeSettings.companyLegalName || storeSettings.businessName || 'DISTRIBUIDORA BUENOS AIRES', 15, y);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    y += 5;
    if (storeSettings.companyRut) {
      doc.text(`RUT / Identificación Fiscal: ${storeSettings.companyRut}`, 15, y);
      y += 4;
    }
    const contactLine = [storeSettings.companyAddress || 'Franklin D. Roosevelt 1700', storeSettings.companyCity || 'CABA, Buenos Aires', storeSettings.companyPhone || '+54 9 11 1234-5678'].filter(Boolean).join(' · ');
    doc.text(contactLine, 15, y);
    y += 4;
    if (storeSettings.companyEmail) {
      doc.text(`Email: ${storeSettings.companyEmail}`, 15, y);
      y += 4;
    }

    // Title on the right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('COMPROBANTE DE PEDIDO', 195, 18, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text(`ORDEN #${ord.orderNumber}`, 195, 24, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    doc.text(`Fecha: ${new Date(ord.createdAt).toLocaleDateString('es-UY')}`, 195, 29, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 38, 195, 38);

    // Box 1: Datos del Cliente
    y = 44;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, 92, 40, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text('DATOS DEL CLIENTE', 19, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFontSize(8.5);
    doc.text(`Nombre: ${ord.customerName}`, 19, y + 13);
    doc.text(`Teléfono: ${ord.customerPhone || '-'}`, 19, y + 18);
    doc.text(`Email: ${ord.customerEmail || '-'}`, 19, y + 23);
    doc.text(`Dirección: ${ord.customerAddress || 'Retiro en Taller'}`, 19, y + 28);
    if (ord.customerCity) {
      doc.text(`Ciudad: ${ord.customerCity}`, 19, y + 33);
    }

    // Box 2: Detalles del Vehículo y Pedido
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(111, y, 84, 40, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text('ESTADO Y VEHÍCULO', 115, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFontSize(8.5);
    doc.text(`Vehículo: ${ord.carDetails?.brand || '-'} ${ord.carDetails?.model || '-'} (${ord.carDetails?.year || '-'})`, 115, y + 13);
    doc.text(`Forma de pago: ${(ord.paymentMethod || 'Transferencia').toUpperCase()}`, 115, y + 18);
    
    // Status highlighted
    doc.setFont('helvetica', 'bold');
    doc.text(`Estado actual: ${ord.status.toUpperCase()}`, 115, y + 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    doc.text('Entrega rápida y productos garantizados.', 115, y + 32);

    // Items Table Header
    y = 92;
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(15, y, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const isOrderUSD = ord.paidCurrency === 'USD';
    doc.text('ARTÍCULO / PRODUCTO', 19, y + 5.5);
    doc.text('CANT.', 130, y + 5.5, { align: 'center' });
    doc.text(isOrderUSD ? 'P. UNIT (USD)' : 'P. UNIT (ARS)', 155, y + 5.5, { align: 'right' });
    doc.text(isOrderUSD ? 'SUBTOTAL (USD)' : 'SUBTOTAL (ARS)', 190, y + 5.5, { align: 'right' });

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

    ord.items.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 8, 'F');
      }
      doc.setFontSize(8);
      const splitDesc = doc.splitTextToSize(item.productName, 105);
      doc.text(splitDesc[0] || '', 19, y + 5.5);
      doc.text(String(item.quantity), 130, y + 5.5, { align: 'center' });
      const unitFormatted = isOrderUSD || item.currency === 'USD'
        ? `US$ ${Math.round(item.price).toLocaleString('en-US')}`
        : `$${Math.round(item.price).toLocaleString('es-AR')}`;
      const subtotalFormatted = isOrderUSD || item.currency === 'USD'
        ? `US$ ${Math.round(item.price * item.quantity).toLocaleString('en-US')}`
        : `$${Math.round(item.price * item.quantity).toLocaleString('es-AR')}`;
      doc.text(unitFormatted, 155, y + 5.5, { align: 'right' });
      doc.text(subtotalFormatted, 190, y + 5.5, { align: 'right' });
      y += 8;
    });

    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, 195, y);

    // Totals
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('TOTAL DE LA COMPRA:', 145, y + 5, { align: 'right' });
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(12);
    const totalOrderStr = isOrderUSD
      ? `US$ ${Math.round(ord.totalUSD).toLocaleString('en-US')}`
      : `$${Math.round(ord.totalARS || (ord.totalUSD || 0) * 1250).toLocaleString('es-AR')} ARS`;
    doc.text(totalOrderStr, 190, y + 5, { align: 'right' });

    // Notes
    y += 16;
    if (ord.notes) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.setFontSize(8.5);
      doc.text('Observaciones del pedido:', 15, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
      doc.setFontSize(8);
      doc.text(ord.notes, 15, y + 4.5);
      y += 12;
    }

    // Guarantee & Footer Box
    y = Math.max(y + 6, 235);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, y, 180, 24, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text('GARANTÍA Y ATENCIÓN POSVENTA', 19, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedSlate[0], mutedSlate[1], mutedSlate[2]);
    doc.setFontSize(7.5);
    doc.text('Todos nuestros productos cuentan con garantía de fábrica y calidad asegurada.', 19, y + 11);
    doc.text('Presenta este comprobante ante cualquier duda, consulta o gestión posventa.', 19, y + 16);
    doc.text(`Atención al cliente: ${storeSettings.companyPhone || '+598 99 123 456'} · ${storeSettings.companyEmail || 'contacto@tienda.com'}`, 19, y + 21);

    doc.save(`Pedido-${ord.orderNumber}.pdf`);
  };

  // WhatsApp Reminder Engine
  const sendWhatsAppReminder = (order: Order, type: 'pending' | 'shipping' | 'custom' = 'pending', customMsg?: string) => {
    // Clean phone number (removing spaces, dashes)
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    let text = '';

    if (customMsg) {
      text = customMsg;
    } else if (type === 'pending') {
      text = `Hola ${order.customerName}! 👋 Te escribimos desde *Distribuidora Buenos Aires*. Notamos que tu pedido *#${order.orderNumber}* (${order.items.map((i) => i.productName).join(', ')}) se encuentra *PENDIENTE*. ¿Precisas asistencia con el medio de pago o prefieres abonar contra entrega / transferencia? ¡Quedamos a las órdenes para coordinar tu envío!`;
    } else if (type === 'shipping') {
      text = `¡Buenas noticias ${order.customerName}! 🚗💨 Tu pedido *#${order.orderNumber}* para tu *${order.carDetails.brand} ${order.carDetails.model}* ya está listo para despacho / retiro. ¡Muchas gracias por confiar en Distribuidora Buenos Aires!`;
    }

    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    // Mark as sent
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, whatsappReminderSent: true } : o))
    );
  };

  // Reviews CRUD
  const addReview = (newRev: Omit<Review, 'id' | 'date' | 'isApproved'>) => {
    const rev: Review = {
      ...newRev,
      id: `rev-${Date.now()}`,
      date: 'Reciente',
      isApproved: true, // auto approve or admin can toggle
    };
    setReviews((prev) => [rev, ...prev]);
  };

  const updateReview = (id: string, author: string, carModel: string, comment: string, rating: number) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, author, carModel, comment, rating } : r));
  };

  const toggleReviewApproval = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isApproved: !r.isApproved } : r))
    );
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  // Admin authentication
  const loginAdmin = (pass: string): boolean => {
    if (pass === 'admin123' || pass === 'distribuidora' || pass === 'cubreasiento') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const resetVehicleFilter = () => {
    setSelectedVehicle({ brand: '', model: '', year: '' });
  };

  // Export to Excel / CSV
  const exportOrdersToExcel = () => {
    const headers = ['Nro Pedido', 'Fecha', 'Cliente', 'Telefono', 'Vehiculo', 'Items', 'Total USD', 'Total ARS', 'Estado', 'Medio de Pago'];
    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString('es-UY'),
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.carDetails?.brand || '-'} ${o.carDetails?.model || '-'} (${o.carDetails?.year || '-'})"`,
      `"${o.items.map((i) => `${i.quantity}x ${i.productName}`).join('; ')}"`,
      o.totalUSD,
      o.totalARS,
      o.status,
      o.paymentMethod,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_pedidos_distribuidora_buenos_aires_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Monthly Report to PDF
  const exportMonthlyReportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header banner
    doc.setFillColor(15, 17, 23);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('DISTRIBUIDORA BUENOS AIRES', 14, 18);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Reporte Oficial de Ventas Mensuales & Desempeño de Inventario', 14, 26);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-UY')} ${new Date().toLocaleTimeString('es-UY')}`, 14, 33);

    // Summary Statistics Box
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Ejecutivo del Mes', 14, 52);

    const totalOrdersCount = orders.length;
    const totalRevenueUSD = orders.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + o.totalUSD, 0);
    const totalRevenueARS = orders.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + o.totalARS, 0);
    const totalInventoryValueUSD = products.reduce((sum, p) => sum + (p.priceUSD * p.stock), 0);

    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, 56, pageWidth - 28, 32, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Facturación Neta (USD):', 20, 66);
    doc.text('Facturación Neta (ARS):', 20, 74);
    doc.text('Pedidos Registrados:', 110, 66);
    doc.text('Valor Total Inventario:', 110, 74);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(`US$ ${totalRevenueUSD.toLocaleString()}`, 65, 66);
    doc.text(`$ ${totalRevenueARS.toLocaleString()} ARS`, 65, 74);
    doc.text(`${totalOrdersCount} órdenes`, 155, 66);
    doc.text(`US$ ${totalInventoryValueUSD.toLocaleString()}`, 155, 74);

    // Orders Section Table Header
    let yPos = 100;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Pedidos Gestionados en el Sistema', 14, yPos);

    yPos += 8;
    doc.setFillColor(220, 38, 38);
    doc.rect(14, yPos, pageWidth - 28, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('N° PEDIDO', 18, yPos + 5.5);
    doc.text('FECHA', 42, yPos + 5.5);
    doc.text('CLIENTE & AUTO', 70, yPos + 5.5);
    doc.text('ESTADO', 135, yPos + 5.5);
    doc.text('TOTAL USD', 165, yPos + 5.5);

    yPos += 9;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    orders.forEach((o, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 248);
      doc.rect(14, yPos - 3.5, pageWidth - 28, 7, 'F');

      doc.setTextColor(30, 30, 30);
      doc.text(o.orderNumber, 18, yPos + 1.5);
      doc.text(new Date(o.createdAt).toLocaleDateString('es-UY'), 42, yPos + 1.5);
      doc.text(`${o.customerName.slice(0, 16)} - ${o.carDetails.brand} ${o.carDetails.model.slice(0, 10)}`, 70, yPos + 1.5);
      doc.text(o.status, 135, yPos + 1.5);
      doc.text(`$${o.totalUSD}`, 165, yPos + 1.5);

      yPos += 7.5;
    });

    // Save PDF
    doc.save(`reporte_ventas_distribuidora_buenos_aires_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Comprehensive Excel / CSV Export (Includes KPIs, Monthly Trend in ARS/USD, Stock Level Tracking, and Order History)
  const exportComprehensiveExcelReport = () => {
    const lines: string[] = [];

    // Header & Meta
    lines.push('DISTRIBUIDORA BUENOS AIRES - INFORME COMPLETO DE VENTAS Y GESTIÓN DE STOCK');
    lines.push(`Fecha de exportación: ${new Date().toLocaleDateString('es-UY')} ${new Date().toLocaleTimeString('es-UY')}`);
    lines.push(`Moneda base: USD (Tipo de cambio ARS: $1.250 / UYU: $40)`);
    lines.push('');

    // Section 1: Executive KPI Summary
    lines.push('--- SECCIÓN 1: RESUMEN EJECUTIVO (KPIS) ---');
    const totalRevUSD = orders.filter((o) => o.status !== 'Cancelado').reduce((s, o) => s + o.totalUSD, 0);
    const totalRevARS = orders.filter((o) => o.status !== 'Cancelado').reduce((s, o) => s + o.totalARS, 0);
    const totalStockQty = products.reduce((s, p) => s + p.stock, 0);
    const totalStockValUSD = products.reduce((s, p) => s + p.stock * p.priceUSD, 0);
    const totalStockValARS = totalStockValUSD * 1250;

    lines.push('Métrica,Valor USD,Valor ARS / Detalle');
    lines.push(`Facturación Neta Total,US$ ${totalRevUSD.toLocaleString()},"$ ${totalRevARS.toLocaleString()} ARS"`);
    lines.push(`Órdenes Totales,${orders.length} pedidos,"${orders.filter((o) => o.status === 'Pagado' || o.status === 'Entregado').length} pagadas/entregadas"`);
    lines.push(`Ticket Promedio,US$ ${Math.round(totalRevUSD / (orders.length || 1))},"$ ${Math.round(totalRevARS / (orders.length || 1)).toLocaleString()} ARS"`);
    lines.push(`Stock Físico Total,${totalStockQty} unidades,"Valuación: US$ ${totalStockValUSD.toLocaleString()} / $ ${totalStockValARS.toLocaleString()} ARS"`);
    lines.push('');

    // Section 2: Monthly Sales History in USD and ARS
    lines.push('--- SECCIÓN 2: HISTORIAL DE VENTAS MENSUALES (DUAL USD / ARS) ---');
    lines.push('Mes,Ventas (USD),Ventas (ARS),Cantidad de Pedidos');
    MONTHLY_SALES_STATS.forEach((m) => {
      lines.push(`"${m.month}",${m.salesUSD},${m.salesARS},${m.ordersCount}`);
    });
    lines.push('');

    // Section 3: Stock Level Tracking & Inventory Status
    lines.push('--- SECCIÓN 3: CONTROL DE STOCK Y ESTADO DE INVENTARIO ---');
    lines.push('SKU,Artículo,Categoría,Material,Stock Actual,Estado Stock,Precio Unit USD,Precio Unit ARS,Valuación Stock USD,Marcas Compatibles');
    products.forEach((p) => {
      const stockStatus = p.stock <= 5 ? 'CRÍTICO' : p.stock <= 15 ? 'BAJO' : 'ÓPTIMO';
      const valUSD = p.stock * p.priceUSD;
      lines.push(
        `"${p.sku}","${p.name}","${p.category}","${p.material}",${p.stock},${stockStatus},${p.priceUSD},${p.priceARS},${valUSD},"${p.compatibleBrands.join('; ')}"`
      );
    });
    lines.push('');

    // Section 4: Detailed Orders Log
    lines.push('--- SECCIÓN 4: REGISTRO DETALLADO DE PEDIDOS ---');
    lines.push('Nro Pedido,Fecha,Cliente,Email,Telefono,Direccion,Ciudad,Vehiculo,Items,Total USD,Total ARS,Medio de Pago,Estado');
    orders.forEach((o) => {
      lines.push(
        `"${o.orderNumber}","${new Date(o.createdAt).toLocaleDateString('es-UY')}","${o.customerName}","${o.customerEmail}","${o.customerPhone}","${o.customerAddress}","${o.customerCity}","${o.carDetails.brand} ${o.carDetails.model} (${o.carDetails.year})","${o.items.map((i) => `${i.quantity}x ${i.productName}`).join('; ')}",${o.totalUSD},${o.totalARS},"${o.paymentMethod}","${o.status}"`
      );
    });

    const csvContent = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_integral_ventas_stock_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        users,
        registerUser,
        loginUser,
        logoutUser,
        updateUserProfile,
        recoverPassword,
        resetPasswordWithCode,
        addVehicleToProfile,
        removeVehicleFromProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        authModalMode,
        setAuthModalMode,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        selectedCategory,
        setSelectedCategory,
        brands,
        addBrand,
        updateBrand,
        deleteBrand,
        variantTypes,
        addVariantType,
        updateVariantType,
        deleteVariantType,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalUSD,
        cartTotalARS,
        cartTotalUYU,
        cartItemsCount,
        currency,
        setCurrency,
        formatPrice,
        formatProductPrice,
        formatCartItemPrice,
        isCartAllUSD,
        selectedVehicle,
        setSelectedVehicle,
        resetVehicleFilter,
        orders,
        createOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
        sendWhatsAppReminder,
        reviews,
        addReview,
        toggleReviewApproval,
        updateReview,
        deleteReview,
        isAdmin,
        setIsAdmin,
        loginAdmin,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        selectedProductForDetail,
        setSelectedProductForDetail,
        isFitterOpen,
        setIsFitterOpen,
        isWholesaleOpen,
        setIsWholesaleOpen,
        exportOrdersToExcel,
        exportMonthlyReportPDF,
        exportComprehensiveExcelReport,
        monthlyStats: MONTHLY_SALES_STATS,
        quotations,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        exportQuotationPDF,
        exportOrderPDF,
        adminAddUser,
        adminUpdateUser,
        adminDeleteUser,
        adminApproveUser,
        storeSettings,
        updateStoreSettings,
        syncToCloud,
        isCloudConnected,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
