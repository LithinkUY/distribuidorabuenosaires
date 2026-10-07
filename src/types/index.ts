export type Currency = 'USD' | 'ARS' | 'UYU';

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Rojo", "Talle L"
  stock: number;
  priceExtraUSD: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  currency?: 'ARS' | 'USD';
  priceUSD: number;
  priceUYU: number;
  priceARS: number;
  stock: number; // base stock or total stock
  sku: string;
  image: string;
  images?: string[];
  additionalImages?: string[];
  video?: string; // Video URL or 'idb:<key>' from IndexedDB
  videoUrl?: string;
  description: string;
  features: string[];
  compatibleBrands: string[]; 
  isFeatured?: boolean;
  material: string;
  rating: number;
  reviewsCount: number;
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  itemCount?: number;
}

export type OrderStatus = 'Pendiente' | 'Pagado' | 'En Confección' | 'En Preparación' | 'Despachado' | 'Entregado' | 'Cancelado';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  currency: Currency;
  quantity: number;
  image: string;
  customization?: {
    carBrand?: string;
    carModel?: string;
    carYear?: string;
    material?: string;
    stitchingColor?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  carDetails: {
    brand: string;
    model: string;
    year: string;
  };
  items: OrderItem[];
  totalUSD: number;
  totalARS: number;
  totalUYU: number;
  paidCurrency: Currency;
  status: OrderStatus;
  paymentMethod: 'mercadopago' | 'tarjeta' | 'transferencia' | 'efectivo';
  createdAt: string;
  notes?: string;
  whatsappReminderSent?: boolean;
}

export interface Review {
  id: string;
  author: string;
  carModel: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  isApproved: boolean;
}

export interface VehicleSelection {
  brand: string;
  model: string;
  year: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  vehicles: VehicleSelection[];
  role: 'customer' | 'admin';
  status?: 'Activo' | 'Pendiente' | 'Suspendido' | 'Rechazado';
  createdAt: string;
  lastLogin?: string;
}

export interface Session {
  token: string;
  user: User;
  expiresAt: string;
}

export interface HeroSlide {
  id: string;
  type: 'image' | 'video';
  mediaUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface MenuItem {
  id: string;
  label: string;
  link: string;
  submenus?: MenuItem[];
}

export interface HomeSection {
  id: string;
  title: string;
  subtitle?: string;
  visible: boolean;
}

export interface Brand {
  id: string;
  name: string;
}

export interface VariantType {
  id: string;
  name: string;
  options: string[];
}

export interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  customerRut?: string;
  carBrand?: string;
  carModel?: string;
  carYear?: string;
  items: QuotationItem[];
  totalUSD: number;
  totalARS: number;
  validUntil: string;
  createdAt: string;
  notes?: string;
  status: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Vencida';
}

export interface ContactSectionSettings {
  badge: string;
  title: string;
  description: string;
  locationTitle: string;
  locationAddress: string;
  hoursTitle: string;
  hoursText: string;
  phonesTitle: string;
  phonesText: string;
  whatsappButtonText: string;
  whatsappNumber: string;
  whatsappMessage: string;
  cardTitle: string;
  cardDescription: string;
  features: string[];
  guaranteeLabel: string;
  guaranteeText: string;
  mapIframeUrl?: string;
  mapGoogleLink?: string;
}

export interface FooterLink {
  id: string;
  label: string;
  actionType: 'section' | 'url' | 'fitter' | 'wholesale';
  target: string;
}

export interface FooterSettings {
  aboutText: string;
  column2Title: string;
  links: FooterLink[];
  column3Title: string;
  column4Title: string;
  showroomAddress: string;
  showroomPhone: string;
  showroomHours: string;
  badgeText: string;
  copyrightText: string;
  subText: string;
}

export interface AlfombrasSectionSettings {
  badge: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  cardBadge: string;
  cardSubtitle: string;
  cardTitle: string;
  cardPriceTag: string;
  feature1Title: string;
  feature1Description: string;
  feature2Title: string;
  feature2Description: string;
  primaryButtonText: string;
  primaryButtonAction: 'catalogo' | 'productos' | 'whatsapp' | 'url';
  primaryButtonUrl?: string;
  secondaryButtonText: string;
  secondaryButtonAction: 'addToCart' | 'catalogo' | 'whatsapp' | 'url';
  secondaryButtonProductId?: string;
  secondaryButtonUrl?: string;
}

export interface StoreSettings {
  businessName: string;
  companyLegalName?: string;
  companyRut?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  companyCity?: string;
  quotationTerms?: string;
  logoUrl: string;
  logoSize: number;
  whatsappNumber: string;
  primaryColor: string;
  headerBgColor: string;
  headerTextColor: string;
  footerBgColor?: string;
  footerTextColor?: string;
  heroSlides: HeroSlide[];
  homeSections: HomeSection[];
  menuItems: MenuItem[];
  addresses: string[];
  defaultCurrency: Currency;
  mercadopagoPublicKey: string;
  mercadopagoAccessToken: string;
  stripePublicKey: string;
  stripeSecretKey: string;
  paypalClientId: string;
  contactSection?: ContactSectionSettings;
  footerSettings?: FooterSettings;
  alfombrasSection?: AlfombrasSectionSettings;
}
