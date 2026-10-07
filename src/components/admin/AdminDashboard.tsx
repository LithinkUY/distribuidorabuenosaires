import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus, Product, Review, Category, Brand, VariantType, Quotation, QuotationItem, User as StoreUser } from '../../types';
import { AnalyticsReportsSection } from './AnalyticsReportsSection';
import { CmsSettings } from './CmsSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { PaymentSettings } from './PaymentSettings';
import {
  BarChart3,
  Palette,
  Layout,
  CreditCard,
  Settings,
  Package,
  ShoppingCart,
  MessageSquare,
  FileDown,
  Plus,
  Trash2,
  Edit3,
  PhoneCall,
  Search,
  Upload,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  List,
  Car,
  Sparkles,
  Check,
  X,
  Star,
  ExternalLink,
  Calendar,
  User,
  Users,
  MapPin,
  FileText,
  Download,
  UserCheck,
  UserX,
  Shield,
  Filter,
  Video,
  Film,
} from 'lucide-react';
import { saveMediaBlob } from '../../utils/mediaStorage';
import { VideoPlayer } from '../VideoPlayer';

export const AdminDashboard: React.FC = () => {
  const {
    products, addProduct, updateProduct, deleteProduct, updateStock,
    categories, addCategory, updateCategory, deleteCategory,
    orders, createOrder, updateOrderStatus, updateOrder, deleteOrder, sendWhatsAppReminder,
    quotations, addQuotation, updateQuotation, deleteQuotation, exportQuotationPDF, exportOrderPDF,
    users, adminAddUser, adminUpdateUser, adminDeleteUser, adminApproveUser, adminRejectUser,
    reviews, addReview, toggleReviewApproval, deleteReview, updateReview,
    brands, addBrand, updateBrand, deleteBrand,
    variantTypes, addVariantType, updateVariantType, deleteVariantType,
    setIsAdmin, exportOrdersToExcel, exportMonthlyReportPDF,
    monthlyStats, formatPrice, storeSettings
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'quotations' | 'inventory' | 'categories' | 'brands' | 'variantTypes' | 'users' | 'reviews' | 'cms' | 'appearance' | 'analytics' | 'payments'
  >('orders');
  
  const [toastMessage, setToastMessage] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // --- FILTROS Y ESTADOS PARA VENTAS ---
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('todos');

  // Modal: Crear Nuevo Pedido
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderCustomerName, setNewOrderCustomerName] = useState('');
  const [newOrderCustomerPhone, setNewOrderCustomerPhone] = useState('');
  const [newOrderCustomerEmail, setNewOrderCustomerEmail] = useState('');
  const [newOrderCustomerAddress, setNewOrderCustomerAddress] = useState('');
  const [newOrderCustomerCity, setNewOrderCustomerCity] = useState('');
  const [newOrderCarBrand, setNewOrderCarBrand] = useState('');
  const [newOrderCarModel, setNewOrderCarModel] = useState('');
  const [newOrderCarYear, setNewOrderCarYear] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('Pendiente');
  const [newOrderPaymentMethod, setNewOrderPaymentMethod] = useState<'mercadopago' | 'transferencia' | 'efectivo' | 'tarjeta'>('transferencia');
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [newOrderItems, setNewOrderItems] = useState<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
  }[]>([
    {
      productId: 'manual-1',
      productName: 'Juego de Cubreasientos a Medida',
      price: 150,
      quantity: 1,
      image: '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg'
    }
  ]);

  const openCreateOrderModal = () => {
    setNewOrderCustomerName('');
    setNewOrderCustomerPhone('');
    setNewOrderCustomerEmail('');
    setNewOrderCustomerAddress('');
    setNewOrderCustomerCity('');
    setNewOrderCarBrand('');
    setNewOrderCarModel('');
    setNewOrderCarYear('');
    setNewOrderStatus('Pendiente');
    setNewOrderPaymentMethod('transferencia');
    setNewOrderNotes('');
    const defaultProduct = products[0];
    setNewOrderItems([
      {
        productId: defaultProduct ? defaultProduct.id : 'manual-1',
        productName: defaultProduct ? defaultProduct.name : 'Juego de Cubreasientos a Medida',
        price: defaultProduct ? defaultProduct.priceUSD : 150,
        quantity: 1,
        image: defaultProduct?.images?.[0] || '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg'
      }
    ]);
    setShowNewOrderModal(true);
  };

  // Modal: Editar Venta
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editOrderCustomerName, setEditOrderCustomerName] = useState('');
  const [editOrderCustomerPhone, setEditOrderCustomerPhone] = useState('');
  const [editOrderCustomerEmail, setEditOrderCustomerEmail] = useState('');
  const [editOrderCustomerAddress, setEditOrderCustomerAddress] = useState('');
  const [editOrderCustomerCity, setEditOrderCustomerCity] = useState('');
  const [editOrderCarBrand, setEditOrderCarBrand] = useState('');
  const [editOrderCarModel, setEditOrderCarModel] = useState('');
  const [editOrderCarYear, setEditOrderCarYear] = useState('');
  const [editOrderStatus, setEditOrderStatus] = useState<OrderStatus>('Pendiente');
  const [editOrderTotalUSD, setEditOrderTotalUSD] = useState<number>(0);
  const [editOrderTotalARS, setEditOrderTotalARS] = useState<number>(0);
  const [editOrderNotes, setEditOrderNotes] = useState('');

  // --- COTIZACIONES (PRESUPUESTOS) ---
  const [quotationSearch, setQuotationSearch] = useState('');
  const [quotationStatusFilter, setQuotationStatusFilter] = useState<string>('todos');
  
  // Modal: Nueva Cotización
  const [showNewQuotationModal, setShowNewQuotationModal] = useState(false);
  const [qCustomerName, setQCustomerName] = useState('');
  const [qCustomerEmail, setQCustomerEmail] = useState('');
  const [qCustomerPhone, setQCustomerPhone] = useState('');
  const [qCustomerCompany, setQCustomerCompany] = useState('');
  const [qCustomerRut, setQCustomerRut] = useState('');
  const [qCarBrand, setQCarBrand] = useState('');
  const [qCarModel, setQCarModel] = useState('');
  const [qCarYear, setQCarYear] = useState('');
  const [qValidUntil, setQValidUntil] = useState(new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
  const [qNotes, setQNotes] = useState('Presupuesto a medida con garantía de 1 año.');
  const [qItems, setQItems] = useState<QuotationItem[]>([
    { description: 'Juego de Cubreasientos a Medida en Cuero Ecológico', quantity: 1, unitPrice: 160, total: 160 }
  ]);

  // Modal: Editar Cotización
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  // --- FILTROS DE PRODUCTOS EN CATALOGO E INVENTARIO ---
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryBrandFilter, setInventoryBrandFilter] = useState('todas');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('todas');
  const [inventoryStockFilter, setInventoryStockFilter] = useState('todos');

  // Product modal state
  const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState(categories[0]?.name || 'Ecocuero línea económica');
  const [prodCurrency, setProdCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [prodPrice, setProdPrice] = useState<number>(150000);
  const [prodPriceUSD, setProdPriceUSD] = useState(150);
  const [prodStock, setProdStock] = useState(10);
  const [prodSku, setProdSku] = useState('');
  const [prodMaterial, setProdMaterial] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodVideo, setProdVideo] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [prodBrands, setProdBrands] = useState('Toyota, VW, Ford, Universal');
  const [prodVariants, setProdVariants] = useState<any[]>([]);

  // --- USUARIOS / CLIENTES ---
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('todos');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newUserCity, setNewUserCity] = useState('');
  const [newUserCarBrand, setNewUserCarBrand] = useState('');
  const [newUserCarModel, setNewUserCarModel] = useState('');
  const [newUserCarYear, setNewUserCarYear] = useState('2024');
  const [newUserRole, setNewUserRole] = useState<'customer' | 'admin'>('customer');
  const [newUserStatus, setNewUserStatus] = useState<'Activo' | 'Pendiente'>('Activo');
  const [newUserPassword, setNewUserPassword] = useState('cliente123');
  const [editingUser, setEditingUser] = useState<StoreUser | null>(null);

  // Category editing state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Brand editing state
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editBrandName, setEditBrandName] = useState('');
  const [showNewBrandModal, setShowNewBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  // VariantType editing state
  const [editingVariantTypeId, setEditingVariantTypeId] = useState<string | null>(null);
  const [editVariantTypeName, setEditVariantTypeName] = useState('');
  const [editVariantTypeOptions, setEditVariantTypeOptions] = useState('');
  const [showNewVariantTypeModal, setShowNewVariantTypeModal] = useState(false);
  const [newVariantTypeName, setNewVariantTypeName] = useState('');
  const [newVariantTypeOptions, setNewVariantTypeOptions] = useState('');

  // Review editing state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewAuthor, setEditReviewAuthor] = useState('');
  const [editReviewCar, setEditReviewCar] = useState('');
  const [editReviewComment, setEditReviewComment] = useState('');
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [showNewReviewModal, setShowNewReviewModal] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewCar, setNewReviewCar] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const safeBrands = brands || [];
  const safeVariantTypes = variantTypes || [];
  const safeQuotations = quotations || [];
  const safeUsers = users || [];

  // Filtered orders / sales
  const filteredOrders = orders.filter(o => {
    const statusMatches = orderStatusFilter === 'todos' || o.status.toLowerCase() === orderStatusFilter.toLowerCase();
    const customer = o.customerName || (o as any).customer?.name || '';
    const phone = o.customerPhone || (o as any).customer?.phone || '';
    const number = o.orderNumber || o.id || '';
    const query = orderSearch.toLowerCase();
    const searchMatches = customer.toLowerCase().includes(query) || phone.toLowerCase().includes(query) || number.toLowerCase().includes(query);
    return statusMatches && searchMatches;
  });

  // Filtered quotations
  const filteredQuotations = safeQuotations.filter(q => {
    const statusMatches = quotationStatusFilter === 'todos' || q.status.toLowerCase() === quotationStatusFilter.toLowerCase();
    const customer = q.customerName || '';
    const number = q.quotationNumber || '';
    const phone = q.customerPhone || '';
    const company = q.customerCompany || '';
    const query = quotationSearch.toLowerCase();
    const searchMatches = customer.toLowerCase().includes(query) || number.toLowerCase().includes(query) || phone.toLowerCase().includes(query) || company.toLowerCase().includes(query);
    return statusMatches && searchMatches;
  });

  // Filtered products for Catalog & Inventory
  const filteredProducts = products.filter(p => {
    const query = inventorySearch.toLowerCase();
    const nameMatch = p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query) || (p.material && p.material.toLowerCase().includes(query));
    
    const brandMatch = inventoryBrandFilter === 'todas' || p.compatibleBrands.some(b => b.toLowerCase().includes(inventoryBrandFilter.toLowerCase()));
    const catMatch = inventoryCategoryFilter === 'todas' || p.category.toLowerCase() === inventoryCategoryFilter.toLowerCase();
    
    let stockMatch = true;
    if (inventoryStockFilter === 'instock') stockMatch = p.stock > 10;
    if (inventoryStockFilter === 'lowstock') stockMatch = p.stock > 0 && p.stock <= 10;
    if (inventoryStockFilter === 'nostock') stockMatch = p.stock === 0;

    return nameMatch && brandMatch && catMatch && stockMatch;
  });

  // Filtered users
  const filteredUsers = safeUsers.filter(u => {
    const query = userSearch.toLowerCase();
    const nameMatch = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.phone.toLowerCase().includes(query);
    const statusMatch = userStatusFilter === 'todos' || (u.status || 'Activo').toLowerCase() === userStatusFilter.toLowerCase();
    return nameMatch && statusMatch;
  });

  // --- HANDLERS PARA CREAR ORDEN MANUAL ---
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderCustomerName.trim()) {
      alert('Por favor ingresa el nombre del cliente');
      return;
    }
    if (newOrderItems.length === 0) {
      alert('Por favor agrega al menos un producto al pedido');
      return;
    }
    
    const calculatedTotalUSD = newOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const created = createOrder({
      customerName: newOrderCustomerName.trim(),
      customerPhone: newOrderCustomerPhone.trim(),
      customerEmail: newOrderCustomerEmail.trim() || 'cliente@tienda.com',
      customerAddress: newOrderCustomerAddress.trim() || 'Retiro en Sucursal / Mostrador',
      customerCity: newOrderCustomerCity.trim() || 'CABA',
      carDetails: {
        brand: newOrderCarBrand.trim(),
        model: newOrderCarModel.trim(),
        year: newOrderCarYear.trim(),
      },
      items: newOrderItems.map(it => ({
        productId: it.productId,
        productName: it.productName.trim() || 'Producto',
        price: it.price,
        quantity: it.quantity,
        currency: 'USD',
        image: it.image || '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg',
      })),
      totalUSD: calculatedTotalUSD,
      totalARS: calculatedTotalUSD * 1250,
      totalUYU: calculatedTotalUSD * 40,
      paidCurrency: 'ARS',
      status: newOrderStatus,
      paymentMethod: newOrderPaymentMethod,
      notes: newOrderNotes.trim(),
    });

    setShowNewOrderModal(false);
    triggerToast(`¡Pedido #${created.orderNumber} creado exitosamente!`);
  };

  // --- HANDLERS PARA COTIZACIONES ---
  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qCustomerName.trim()) return alert('Ingresa el nombre del cliente');
    
    const totalUSD = qItems.reduce((sum, item) => sum + item.total, 0);
    const totalARS = totalUSD * 1250;

    addQuotation({
      customerName: qCustomerName.trim(),
      customerEmail: qCustomerEmail.trim(),
      customerPhone: qCustomerPhone.trim(),
      customerCompany: qCustomerCompany.trim(),
      customerRut: qCustomerRut.trim(),
      carBrand: qCarBrand.trim(),
      carModel: qCarModel.trim(),
      carYear: qCarYear.trim(),
      items: qItems,
      totalUSD,
      totalARS,
      validUntil: qValidUntil,
      notes: qNotes.trim(),
      status: 'Pendiente',
    });

    setShowNewQuotationModal(false);
    triggerToast('¡Cotización creada con éxito!');
  };

  const handleOpenEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditOrderCustomerName(order.customerName || (order as any).customer?.name || '');
    setEditOrderCustomerPhone(order.customerPhone || (order as any).customer?.phone || '');
    setEditOrderCustomerEmail(order.customerEmail || (order as any).customer?.email || '');
    setEditOrderCustomerAddress(order.customerAddress || (order as any).customer?.address || '');
    setEditOrderCustomerCity(order.customerCity || (order as any).customer?.city || '');
    setEditOrderCarBrand(order.carDetails?.brand || (order as any).vehicle?.brand || '');
    setEditOrderCarModel(order.carDetails?.model || (order as any).vehicle?.model || '');
    setEditOrderCarYear(order.carDetails?.year || (order as any).vehicle?.year || '');
    setEditOrderStatus(order.status);
    setEditOrderTotalUSD(order.totalUSD || (order as any).total || 0);
    setEditOrderTotalARS(order.totalARS || ((order as any).total || 0) * 1250);
    setEditOrderNotes(order.notes || '');
  };

  const handleSaveOrder = () => {
    if (!editingOrder) return;
    updateOrder(editingOrder.id, {
      customerName: editOrderCustomerName,
      customerPhone: editOrderCustomerPhone,
      customerEmail: editOrderCustomerEmail,
      customerAddress: editOrderCustomerAddress,
      customerCity: editOrderCustomerCity,
      carDetails: {
        brand: editOrderCarBrand,
        model: editOrderCarModel,
        year: editOrderCarYear,
      },
      status: editOrderStatus,
      totalUSD: editOrderTotalUSD,
      totalARS: editOrderTotalARS,
      notes: editOrderNotes,
    });
    setEditingOrder(null);
    triggerToast('¡Venta actualizada con éxito!');
  };

  const handleNewProduct = () => {
    setIsEditingProduct(null);
    setProdName('');
    setProdCategory(categories[0]?.name || 'Ecocuero línea económica');
    setProdCurrency('ARS');
    setProdPrice(150000);
    setProdPriceUSD(120);
    setProdStock(20);
    setProdSku('PROD-' + Date.now().toString().slice(-4));
    setProdMaterial('Cuero Ecológico');
    setProdDescription('');
    setProdImage('');
    setProdImages([]);
    setProdVideo('');
    setProdBrands('Toyota, Volkswagen, Ford, Chevrolet, Universal');
    setProdVariants([]);
    setShowProductModal(true);
  };

  const handleEditProduct = (p: Product) => {
    setIsEditingProduct(p);
    setProdName(p.name);
    setProdCategory(p.category);
    const curr = p.currency || (p.priceARS && p.priceARS > 1000 ? 'ARS' : 'USD');
    setProdCurrency(curr);
    if (curr === 'ARS') {
      setProdPrice(p.priceARS || (p.priceUSD ? p.priceUSD * 1250 : 150000));
    } else {
      setProdPrice(p.priceUSD || 120);
    }
    setProdPriceUSD(p.priceUSD);
    setProdStock(p.stock);
    setProdSku(p.sku);
    setProdMaterial(p.material);
    setProdDescription(p.description);
    setProdImage(p.image);
    setProdImages(p.images || []);
    setProdVideo(p.video || p.videoUrl || '');
    setProdBrands(p.compatibleBrands.join(', '));
    setProdVariants(p.variants || []);
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    const brandsArray = prodBrands.split(',').map(s => s.trim()).filter(Boolean);
    const finalPriceUSD = prodCurrency === 'USD' ? prodPrice : Math.round(prodPrice / 1250);
    const finalPriceARS = prodCurrency === 'ARS' ? prodPrice : Math.round(prodPrice * 1250);

    if (isEditingProduct) {
      updateProduct({
        ...isEditingProduct,
        name: prodName,
        category: prodCategory,
        currency: prodCurrency,
        priceUSD: finalPriceUSD,
        priceARS: finalPriceARS,
        priceUYU: finalPriceUSD * 40,
        stock: prodStock,
        sku: prodSku,
        material: prodMaterial,
        description: prodDescription,
        image: prodImages[0] || prodImage || isEditingProduct.image,
        images: prodImages,
        video: prodVideo,
        videoUrl: prodVideo,
        compatibleBrands: brandsArray.length > 0 ? brandsArray : ['Universal'],
        variants: prodVariants
      });
      triggerToast('¡Producto actualizado correctamente!');
    } else {
      addProduct({
        id: 'prod-' + Date.now(),
        name: prodName,
        category: prodCategory,
        currency: prodCurrency,
        priceUSD: finalPriceUSD,
        priceARS: finalPriceARS,
        priceUYU: finalPriceUSD * 40,
        stock: prodStock,
        sku: prodSku,
        material: prodMaterial,
        description: prodDescription,
        image: prodImages[0] || prodImage || '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg',
        images: prodImages,
        video: prodVideo,
        videoUrl: prodVideo,
        compatibleBrands: brandsArray.length > 0 ? brandsArray : ['Universal'],
        features: ['Fundas en stock inmediato', 'Protección contra desgaste', 'Fácil instalación'],
        rating: 5.0,
        reviewsCount: 0,
        variants: prodVariants
      });
      triggerToast('¡Producto creado con éxito!');
    }
    setShowProductModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-3 animate-fade-in border border-emerald-400/40">
          <CheckCircle className="w-5 h-5 text-white" />
          {toastMessage}
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
            Admin<span className="text-blue-600">Panel</span>
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto py-4 space-y-1.5 px-3">
          {[
            { id: 'orders', label: 'Ventas y Pedidos', icon: ShoppingCart, count: orders.length },
            { id: 'quotations', label: 'Cotizaciones (PDF)', icon: FileText, count: safeQuotations.length },
            { id: 'inventory', label: 'Catálogo e Inventario', icon: Package, count: products.length },
            { id: 'categories', label: 'Categorías', icon: Layers, count: categories.length },
            { id: 'brands', label: 'Marcas', icon: Car, count: safeBrands.length },
            { id: 'variantTypes', label: 'Tipos (Atributos)', icon: List, count: safeVariantTypes.length },
            { id: 'users', label: 'Clientes', icon: Users, count: safeUsers.length },
            { id: 'reviews', label: 'Reseñas del Home', icon: MessageSquare, count: reviews.length },
            { id: 'cms', label: 'CMS & Gestor del Home', icon: Layout },
            { id: 'appearance', label: 'Apariencia & Empresa', icon: Palette },
            { id: 'analytics', label: 'Dashboard & Reportes', icon: BarChart3 },
            { id: 'payments', label: 'Pagos y Pasarelas', icon: CreditCard },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => setIsAdmin(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" /> Volver a la Tienda
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'analytics' && <AnalyticsReportsSection />}
          {activeTab === 'cms' && <CmsSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'payments' && <PaymentSettings />}
          
          {/* VENTAS Y PEDIDOS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                    <ShoppingCart className="text-blue-600 w-7 h-7" /> Listado de Ventas y Pedidos
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Crea órdenes manuales, edita ventas existentes, cambia estados o elimina registros.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={openCreateOrderModal}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" /> + Crear Nuevo Pedido
                  </button>
                  <button
                    onClick={exportOrdersToExcel}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors shrink-0"
                  >
                    <FileDown className="w-4 h-4" /> Exportar a Excel
                  </button>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                  <div className="text-xs text-slate-500 font-semibold">Total de Ventas</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{orders.length} pedidos</div>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                  <div className="text-xs text-slate-500 font-semibold">Ventas Pagadas / Entregadas</div>
                  <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                    {orders.filter(o => o.status === 'Pagado' || o.status === 'Entregado').length} ventas
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                  <div className="text-xs text-slate-500 font-semibold">Facturación Estimada (ARS)</div>
                  <div className="text-2xl font-extrabold text-blue-600 mt-1">
                    $ {orders.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + (o.totalARS || (o.totalUSD || (o as any).total || 0) * 1250), 0).toLocaleString('es-AR')} ARS
                  </div>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    placeholder="Buscar por cliente, teléfono o #orden..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                  {(['todos', 'Pendiente', 'Pagado', 'En Confección', 'Despachado', 'Entregado', 'Cancelado'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        orderStatusFilter === st
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'todos' ? 'Todos' : st === 'En Confección' ? 'En Preparación' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
                    <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-700">No se encontraron pedidos con estos filtros.</p>
                    <button
                      onClick={openCreateOrderModal}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" /> + Crear Nuevo Pedido
                    </button>
                  </div>
                ) : (
                  filteredOrders.map(order => {
                    const custName = order.customerName || (order as any).customer?.name || 'Cliente';
                    const custPhone = order.customerPhone || (order as any).customer?.phone || '';
                    const custEmail = order.customerEmail || (order as any).customer?.email || '';
                    const custAddress = order.customerAddress || (order as any).customer?.address || '';
                    const carBrand = order.carDetails?.brand || (order as any).vehicle?.brand || '-';
                    const carModel = order.carDetails?.model || (order as any).vehicle?.model || '-';
                    const carYear = order.carDetails?.year || (order as any).vehicle?.year || '';
                    const orderTotal = order.totalUSD || (order as any).total || 0;

                    return (
                      <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all">
                        {/* Top bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-sm bg-slate-100 text-slate-800 px-3 py-1 rounded-lg">
                              #{order.orderNumber || order.id}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Reciente'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Status Selector Dropdown */}
                            <select
                              value={order.status}
                              onChange={(e) => {
                                updateOrderStatus(order.id, e.target.value as any);
                                triggerToast('Estado de venta actualizado');
                              }}
                              className={`cursor-pointer text-xs font-bold px-3 py-1.5 rounded-xl border ${
                                order.status === 'Pendiente' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                                order.status === 'Pagado' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                order.status === 'En Confección' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                                order.status === 'Despachado' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                                order.status === 'Entregado' ? 'bg-emerald-100 text-emerald-900 border-emerald-400' :
                                'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="Pagado">Pagado</option>
                              <option value="En Confección">En Preparación</option>
                              <option value="Despachado">Despachado</option>
                              <option value="Entregado">Entregado</option>
                              <option value="Cancelado">Cancelado</option>
                            </select>

                            {/* DOWNLOAD PDF */}
                            <button
                              onClick={() => exportOrderPDF(order)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
                              title="Descargar Comprobante / Factura en PDF"
                            >
                              <Download className="w-3.5 h-3.5" /> PDF
                            </button>

                            {/* EDIT BUTTON */}
                            <button
                              onClick={() => handleOpenEditOrder(order)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                              title="Editar datos de esta venta"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Editar
                            </button>

                            {/* DELETE BUTTON */}
                            <button
                              onClick={() => {
                                if (confirm(`¿Estás seguro de eliminar la venta #${order.orderNumber || order.id}?`)) {
                                  deleteOrder(order.id);
                                  triggerToast('Venta eliminada con éxito');
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                              title="Eliminar venta"
                            >
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Col 1: Customer */}
                          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                              <User className="w-4 h-4 text-blue-600" /> {custName}
                            </div>
                            {custPhone && <div className="text-slate-600"><b>Tel:</b> {custPhone}</div>}
                            {custEmail && <div className="text-slate-600 truncate"><b>Email:</b> {custEmail}</div>}
                            {custAddress && (
                              <div className="text-slate-600 flex items-start gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span>{custAddress}</span>
                              </div>
                            )}
                          </div>

                          {/* Col 2: Payment & Notes */}
                          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-blue-600" />
                              <span className="capitalize">Pago: {order.paymentMethod || 'Web'}</span>
                            </div>
                            <div className="text-slate-600">
                              <b>Entrega:</b> {order.customerCity || 'Retiro / Envío'}
                            </div>
                            {order.notes && (
                              <div className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200 italic mt-1">
                                "{order.notes}"
                              </div>
                            )}
                          </div>

                          {/* Col 3: Items & Totals */}
                          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                            <div>
                              <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1">
                                <Package className="w-4 h-4 text-blue-600" /> Productos Comprados:
                              </div>
                              <div className="space-y-1 max-h-24 overflow-y-auto">
                                {order.items && order.items.length > 0 ? (
                                  order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-slate-600 text-[11px]">
                                      <span className="truncate pr-2">{item.productName} (x{item.quantity})</span>
                                      <span className="font-semibold text-slate-800 shrink-0">
                                        {item.currency === 'USD'
                                          ? `US$ ${Math.round(item.price * item.quantity).toLocaleString('en-US')}`
                                          : `$ ${Math.round(item.price * item.quantity).toLocaleString('es-AR')}`}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-slate-500">1x Pedido Personalizado</div>
                                )}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline mt-2">
                              <span className="font-bold text-slate-700">Total Venta:</span>
                              <div className="text-right">
                                <div className="text-base font-extrabold text-blue-600">
                                  {order.paidCurrency === 'USD'
                                    ? `US$ ${Math.round(order.totalUSD).toLocaleString('en-US')}`
                                    : `$ ${Math.round(order.totalARS || orderTotal * 1250).toLocaleString('es-AR')} ARS`}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* WhatsApp reminder footer if phone exists */}
                        {custPhone && (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => sendWhatsAppReminder(order, 'pending')}
                              className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
                            >
                              <PhoneCall className="w-3.5 h-3.5" /> Enviar WhatsApp al Cliente
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* COTIZACIONES Y PRESUPUESTOS TAB */}
          {activeTab === 'quotations' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                    <FileText className="text-blue-600 w-7 h-7" /> Cotizaciones y Presupuestos
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Genera cotizaciones formales para clientes o empresas, edítalas y descárgalas en formato PDF membretado con RUT y datos fiscales.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewQuotationModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" /> + Nueva Cotización
                </button>
              </div>

              {/* Search & Status filter */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={quotationSearch}
                    onChange={e => setQuotationSearch(e.target.value)}
                    placeholder="Buscar por cliente, empresa, RUT o #cotización..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                  {(['todos', 'Pendiente', 'Aprobada', 'Rechazada', 'Vencida'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setQuotationStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        quotationStatusFilter === st
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'todos' ? 'Todas' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quotations List */}
              <div className="space-y-4">
                {filteredQuotations.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No se encontraron cotizaciones.</p>
                  </div>
                ) : (
                  filteredQuotations.map(q => (
                    <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-lg">
                            {q.quotationNumber}
                          </span>
                          <span className="text-xs text-slate-500">
                            Válido hasta: <b>{new Date(q.validUntil).toLocaleDateString()}</b>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={q.status}
                            onChange={(e) => {
                              updateQuotation(q.id, { status: e.target.value as any });
                              triggerToast('Estado de cotización actualizado');
                            }}
                            className={`cursor-pointer text-xs font-bold px-3 py-1.5 rounded-xl border ${
                              q.status === 'Pendiente' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                              q.status === 'Aprobada' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                              q.status === 'Rechazada' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                              'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Aprobada">Aprobada</option>
                            <option value="Rechazada">Rechazada</option>
                            <option value="Vencida">Vencida</option>
                          </select>

                          {/* PDF DOWNLOAD BUTTON */}
                          <button
                            onClick={() => {
                              exportQuotationPDF(q);
                              triggerToast('Descargando PDF de cotización...');
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                            title="Descargar presupuesto formal en PDF"
                          >
                            <Download className="w-3.5 h-3.5" /> Descargar PDF
                          </button>

                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => setEditingQuotation(q)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Editar
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar la cotización ${q.quotationNumber}?`)) {
                                deleteQuotation(q.id);
                                triggerToast('Cotización eliminada');
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                          <div className="font-bold text-slate-800 text-sm">{q.customerName}</div>
                          {q.customerCompany && <div className="text-slate-600 font-semibold">{q.customerCompany}</div>}
                          {q.customerRut && <div className="text-slate-500 font-mono text-[11px]">RUT/Doc: {q.customerRut}</div>}
                          {q.customerPhone && <div className="text-slate-600">Tel: {q.customerPhone}</div>}
                          {q.customerEmail && <div className="text-slate-600 truncate">Email: {q.customerEmail}</div>}
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                          <div className="font-bold text-slate-800 text-sm">Vehículo & Notas</div>
                          <div className="text-slate-700">{q.carBrand || '-'} {q.carModel || '-'} {q.carYear || ''}</div>
                          {q.notes && <div className="text-slate-600 italic bg-white p-2 rounded border border-slate-200 mt-1">"{q.notes}"</div>}
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            <div className="font-bold text-slate-800 text-xs mb-1">Ítems Presupuestados:</div>
                            {q.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                                <span className="truncate pr-2">{it.quantity}x {it.description}</span>
                                <span className="font-semibold text-slate-800 shrink-0">$ {Math.round(it.total * 1250).toLocaleString('es-AR')}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline mt-2">
                            <span className="font-bold text-slate-700">Total Cotizado:</span>
                            <div className="text-right">
                              <div className="text-base font-extrabold text-blue-600">${q.totalARS.toLocaleString('es-AR')} ARS</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CATALOGO E INVENTARIO (CON BUSCADOR Y FILTROS AVANZADOS) */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Package className="text-blue-500 w-7 h-7" /> Catálogo e Inventario
                  </h2>
                  <p className="text-slate-600 text-sm">Busca productos por nombre, SKU, marca compatible y categoría.</p>
                </div>
                <button onClick={handleNewProduct} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" /> + Nuevo Producto
                </button>
              </div>

              {/* BUSCADOR Y FILTROS */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Búsqueda por texto */}
                  <div className="relative md:col-span-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inventorySearch}
                      onChange={e => setInventorySearch(e.target.value)}
                      placeholder="Buscar por nombre, SKU o material..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* Filtro por Marca */}
                  <div>
                    <select
                      value={inventoryBrandFilter}
                      onChange={e => setInventoryBrandFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                    >
                      <option value="todas">Todas las marcas</option>
                      {safeBrands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Categoría / Tipo */}
                  <div>
                    <select
                      value={inventoryCategoryFilter}
                      onChange={e => setInventoryCategoryFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                    >
                      <option value="todas">Todas las categorías</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Stock */}
                  <div>
                    <select
                      value={inventoryStockFilter}
                      onChange={e => setInventoryStockFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                    >
                      <option value="todos">Todos los stocks</option>
                      <option value="instock">En Stock (&gt;10)</option>
                      <option value="lowstock">Bajo Stock (1-10)</option>
                      <option value="nostock">Sin Stock (0)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span>Mostrando <b>{filteredProducts.length}</b> de {products.length} productos</span>
                  {(inventorySearch || inventoryBrandFilter !== 'todas' || inventoryCategoryFilter !== 'todas' || inventoryStockFilter !== 'todos') && (
                    <button
                      onClick={() => {
                        setInventorySearch('');
                        setInventoryBrandFilter('todas');
                        setInventoryCategoryFilter('todas');
                        setInventoryStockFilter('todos');
                      }}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>

              {/* Grid de Productos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm group hover:border-slate-300 transition-all">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-4">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button onClick={() => handleEditProduct(product)} className="p-2 bg-white text-blue-600 rounded-xl shadow-md hover:bg-blue-50 transition-colors" title="Editar"><Edit3 className="w-4 h-4"/></button>
                        <button onClick={() => { if (confirm('¿Eliminar producto?')) { deleteProduct(product.id); triggerToast('Producto eliminado'); } }} className="p-2 bg-white text-red-600 rounded-xl shadow-md hover:bg-red-50 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm line-clamp-1">{product.name}</div>
                      <div className="text-xs text-slate-500 mt-1 flex justify-between">
                        <span>{product.category}</span>
                        <span className="font-mono text-[10px] text-slate-400">{product.sku}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.compatibleBrands.slice(0, 3).map((br, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {br}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            {product.currency === 'USD'
                              ? `US$ ${Math.round(product.priceUSD).toLocaleString('en-US')}`
                              : `$ ${Math.round(product.priceARS || (product.priceUSD * 1250)).toLocaleString('es-AR')}`}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            product.currency === 'USD' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {product.currency === 'USD' ? 'USD' : 'ARS'}
                          </span>
                        </div>
                        <div className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          product.stock > 10 ? 'bg-emerald-50 text-emerald-700' :
                          product.stock > 0 ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          Stock: {product.stock}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLIENTES TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                    <Users className="text-blue-600 w-7 h-7" /> Gestión de Clientes y Registros
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Administra los clientes registrados, aprueba o rechaza solicitudes pendientes de registro, edita perfiles o agrega nuevos clientes al sistema.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewUserModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" /> + Nuevo Cliente
                </button>
              </div>

              {/* Search & Filter */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Buscar cliente por nombre, email, teléfono o auto..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                  {(['todos', 'Pendiente', 'Activo', 'Rechazado', 'Suspendido'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setUserStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        userStatusFilter === st
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'todos' ? 'Todos' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clients List */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No se encontraron clientes registrados con los filtros seleccionados.
                    </div>
                  ) : (
                    filteredUsers.map(u => {
                      const status = u.status || 'Activo';
                      const customerOrders = orders.filter(
                        o => (u.email && o.customerEmail?.toLowerCase() === u.email.toLowerCase()) ||
                             (u.name && o.customerName?.toLowerCase() === u.name.toLowerCase())
                      );

                      return (
                        <div key={u.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                          <div className="flex items-start gap-3.5">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                              u.role === 'admin' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {u.role === 'admin' ? 'Administrador' : 'Cliente'}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  status === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  status === 'Pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  status === 'Rechazado' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                  'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  ● {status}
                                </span>
                              </div>

                              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span>{u.email}</span>
                                {u.phone && <span>• Tel: {u.phone}</span>}
                                {u.city && <span>• {u.city}</span>}
                                {customerOrders.length > 0 && (
                                  <span className="font-semibold text-blue-600">
                                    • {customerOrders.length} pedido(s)
                                  </span>
                                )}
                                {u.createdAt && (
                                  <span className="text-[11px] text-slate-400">
                                    • Reg: {new Date(u.createdAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {/* APPROVE BUTTON FOR PENDING */}
                            {status === 'Pendiente' && (
                              <button
                                onClick={() => {
                                  adminApproveUser(u.id);
                                  triggerToast(`Registro de ${u.name} aceptado y activado`);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                                title="Aceptar solicitud de registro"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Aceptar Registro
                              </button>
                            )}

                            {/* REJECT BUTTON FOR PENDING */}
                            {status === 'Pendiente' && (
                              <button
                                onClick={() => {
                                  adminRejectUser(u.id);
                                  triggerToast(`Registro de ${u.name} rechazado`);
                                }}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                                title="Rechazar solicitud de registro"
                              >
                                <UserX className="w-3.5 h-3.5" /> Rechazar
                              </button>
                            )}

                            {/* REACTIVATE BUTTON FOR REJECTED */}
                            {status === 'Rechazado' && (
                              <button
                                onClick={() => {
                                  adminApproveUser(u.id);
                                  triggerToast(`Cuenta de ${u.name} reactivada como Activo`);
                                }}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                                title="Reactivar y aceptar cuenta rechazada"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Reactivar
                              </button>
                            )}

                            {/* EDIT BUTTON */}
                            <button
                              onClick={() => setEditingUser(u)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Editar
                            </button>

                            {/* DELETE BUTTON */}
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar al cliente ${u.name} definitivamente del sistema?`)) {
                                  adminDeleteUser(u.id);
                                  triggerToast('Cliente eliminado');
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-xl"
                              title="Eliminar cliente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="text-blue-500 w-6 h-6" /> Gestión de Categorías
                  </h2>
                  <p className="text-slate-600 text-sm">Edita los nombres, descripciones y crea nuevas categorías para tu tienda.</p>
                </div>
                <button
                  onClick={() => {
                    setNewCatName('');
                    setNewCatDesc('');
                    setShowNewCatModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Nueva Categoría
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(c => {
                  const isEditing = editingCatId === c.id;

                  if (isEditing) {
                    return (
                      <div key={c.id} className="bg-white border-2 border-blue-500 p-5 rounded-2xl shadow-md space-y-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4" /> Editando Categoría
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                          <input
                            type="text"
                            value={editCatName}
                            onChange={e => setEditCatName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:border-blue-500 outline-none"
                            placeholder="Nombre de categoría"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
                          <input
                            type="text"
                            value={editCatDesc}
                            onChange={e => setEditCatDesc(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 outline-none"
                            placeholder="Descripción de la categoría"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setEditingCatId(null)}
                            className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Cancelar
                          </button>
                          <button
                            onClick={() => {
                              if (!editCatName.trim()) return alert('Ingresa un nombre');
                              updateCategory(c.id, editCatName.trim(), editCatDesc.trim());
                              setEditingCatId(null);
                              triggerToast('¡Categoría guardada con éxito!');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                          >
                            <Check className="w-4 h-4" /> Guardar Cambios
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={c.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-sm hover:border-slate-300 transition-all">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
                            /{c.slug}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                          {c.description || 'Sin descripción'}
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setEditingCatId(c.id);
                            setEditCatName(c.name);
                            setEditCatDesc(c.description || '');
                          }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar categoría "${c.name}"?`)) {
                              deleteCategory(c.id);
                              triggerToast('Categoría eliminada');
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BRANDS TAB */}
          {activeTab === 'brands' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Car className="text-blue-500 w-6 h-6" /> Marcas de Vehículos
                  </h2>
                  <p className="text-slate-600 text-sm">Gestiona las marcas compatibles disponibles en la tienda.</p>
                </div>
                <button
                  onClick={() => {
                    setNewBrandName('');
                    setShowNewBrandModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Nueva Marca
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {safeBrands.map(b => {
                  const isEditing = editingBrandId === b.id;

                  if (isEditing) {
                    return (
                      <div key={b.id} className="bg-white border-2 border-blue-500 p-4 rounded-2xl shadow-md space-y-3">
                        <input
                          type="text"
                          value={editBrandName}
                          onChange={e => setEditBrandName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-900 font-bold focus:border-blue-500 outline-none"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => setEditingBrandId(null)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4"/></button>
                          <button
                            onClick={() => {
                              if (!editBrandName.trim()) return;
                              updateBrand(b.id, editBrandName.trim());
                              setEditingBrandId(null);
                              triggerToast('Marca guardada');
                            }}
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Guardar
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={b.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:border-slate-300 transition-all">
                      <span className="text-sm text-slate-900 font-bold">{b.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingBrandId(b.id);
                            setEditBrandName(b.name);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4"/>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar marca "${b.name}"?`)) {
                              deleteBrand(b.id);
                              triggerToast('Marca eliminada');
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VARIANT TYPES TAB */}
          {activeTab === 'variantTypes' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <List className="text-blue-500 w-6 h-6" /> Tipos y Atributos de Variantes
                  </h2>
                  <p className="text-slate-600 text-sm">Define atributos globales como Color, Talle, Material y sus opciones.</p>
                </div>
                <button
                  onClick={() => {
                    setNewVariantTypeName('');
                    setNewVariantTypeOptions('');
                    setShowNewVariantTypeModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Nuevo Atributo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeVariantTypes.map(v => {
                  const isEditing = editingVariantTypeId === v.id;

                  if (isEditing) {
                    return (
                      <div key={v.id} className="bg-white border-2 border-blue-500 p-5 rounded-2xl shadow-md space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Atributo</label>
                          <input
                            type="text"
                            value={editVariantTypeName}
                            onChange={e => setEditVariantTypeName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Opciones (separadas por coma)</label>
                          <input
                            type="text"
                            value={editVariantTypeOptions}
                            onChange={e => setEditVariantTypeOptions(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 outline-none"
                            placeholder="Negro, Gris, Rojo..."
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => setEditingVariantTypeId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                          <button
                            onClick={() => {
                              if (!editVariantTypeName.trim()) return;
                              const opts = editVariantTypeOptions.split(',').map(s => s.trim()).filter(Boolean);
                              updateVariantType(v.id, editVariantTypeName.trim(), opts);
                              setEditingVariantTypeId(null);
                              triggerToast('Atributo guardado');
                            }}
                            className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                          >
                            <Check className="w-4 h-4" /> Guardar Cambios
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={v.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-sm hover:border-slate-300 transition-all">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-base text-slate-900 font-bold">{v.name}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingVariantTypeId(v.id);
                                setEditVariantTypeName(v.name);
                                setEditVariantTypeOptions(v.options.join(', '));
                              }}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar atributo "${v.name}"?`)) {
                                  deleteVariantType(v.id);
                                  triggerToast('Atributo eliminado');
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-red-500 rounded-xl"
                            >
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {v.options.map((opt, i) => (
                            <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-xs rounded-lg text-slate-700 font-medium">
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="text-blue-500 w-6 h-6" /> Moderación y Reseñas
                  </h2>
                  <p className="text-slate-600 text-sm">Gestiona y edita las opiniones que aparecen en la tienda.</p>
                </div>
                <button
                  onClick={() => {
                    setNewReviewAuthor('');
                    setNewReviewCar('');
                    setNewReviewComment('');
                    setNewReviewRating(5);
                    setShowNewReviewModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Nueva Reseña
                </button>
              </div>

              <div className="grid gap-4">
                {reviews.map(review => {
                  const isEditing = editingReviewId === review.id;

                  if (isEditing) {
                    return (
                      <div key={review.id} className="bg-white border-2 border-blue-500 p-5 rounded-2xl shadow-md space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Autor</label>
                            <input
                              type="text"
                              value={editReviewAuthor}
                              onChange={e => setEditReviewAuthor(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Modelo de Auto</label>
                            <input
                              type="text"
                              value={editReviewCar}
                              onChange={e => setEditReviewCar(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Estrellas (1 al 5)</label>
                            <select
                              value={editReviewRating}
                              onChange={e => setEditReviewRating(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                            >
                              <option value={5}>5 Estrellas</option>
                              <option value={4}>4 Estrellas</option>
                              <option value={3}>3 Estrellas</option>
                              <option value={2}>2 Estrellas</option>
                              <option value={1}>1 Estrella</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Comentario</label>
                          <textarea
                            value={editReviewComment}
                            onChange={e => setEditReviewComment(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => setEditingReviewId(null)} className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                          <button
                            onClick={() => {
                              updateReview(review.id, editReviewAuthor, editReviewCar, editReviewComment, editReviewRating);
                              setEditingReviewId(null);
                              triggerToast('Reseña actualizada con éxito');
                            }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                          >
                            <Check className="w-4 h-4" /> Guardar Reseña
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="font-bold text-slate-900 text-base">{review.author}</div>
                          <span className="text-slate-400">•</span>
                          <div className="text-slate-600 text-xs font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                            {review.carModel}
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(review.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              toggleReviewApproval(review.id);
                              triggerToast(review.isApproved ? 'Reseña ocultada' : 'Reseña aprobada');
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                              review.isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {review.isApproved ? '✓ Aprobada' : 'Oculta'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingReviewId(review.id);
                              setEditReviewAuthor(review.author);
                              setEditReviewCar(review.carModel);
                              setEditReviewComment(review.comment);
                              setEditReviewRating(review.rating || 5);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Editar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar reseña?')) {
                                deleteReview(review.id);
                                triggerToast('Reseña eliminada');
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3 leading-relaxed">
                        "{review.comment}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: CREAR NUEVO PEDIDO */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <form onSubmit={handleCreateOrder} className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="text-blue-600 w-5 h-5" /> Crear Nuevo Pedido
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Ingresa los datos del cliente, selecciona los productos y define el estado del pedido.</p>
              </div>
              <button type="button" onClick={() => setShowNewOrderModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Cliente Registrado opcional */}
            {safeUsers.length > 0 && (
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs">
                <label className="block font-bold text-blue-900 mb-1">Cargar datos desde usuario registrado (opcional):</label>
                <select
                  onChange={(e) => {
                    const selUser = safeUsers.find(u => u.id === e.target.value);
                    if (selUser) {
                      setNewOrderCustomerName(selUser.name);
                      setNewOrderCustomerEmail(selUser.email);
                      setNewOrderCustomerPhone(selUser.phone);
                      if (selUser.address) setNewOrderCustomerAddress(selUser.address);
                      if (selUser.city) setNewOrderCustomerCity(selUser.city);
                    }
                  }}
                  defaultValue=""
                  className="w-full bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none font-medium"
                >
                  <option value="">-- Seleccionar cliente existente o escribir manualmente abajo --</option>
                  {safeUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email}) - {u.phone}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Datos del Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Cliente *</label>
                <input required type="text" value={newOrderCustomerName} onChange={e => setNewOrderCustomerName(e.target.value)} placeholder="Ej: Roberto Gómez" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                <input type="text" value={newOrderCustomerPhone} onChange={e => setNewOrderCustomerPhone(e.target.value)} placeholder="Ej: +5491144556677" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input type="email" value={newOrderCustomerEmail} onChange={e => setNewOrderCustomerEmail(e.target.value)} placeholder="cliente@correo.com" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección / Localidad</label>
                <input type="text" value={newOrderCustomerAddress} onChange={e => setNewOrderCustomerAddress(e.target.value)} placeholder="Av. Santa Fe 3200, CABA" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500" />
              </div>
            </div>

            {/* Productos / Ítems del Pedido */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-xs">Productos del Pedido</span>
                <button
                  type="button"
                  onClick={() => {
                    const firstProd = products[0];
                    setNewOrderItems([
                      ...newOrderItems,
                      {
                        productId: firstProd ? firstProd.id : 'manual-' + Date.now(),
                        productName: firstProd ? firstProd.name : 'Producto Adicional',
                        price: firstProd ? firstProd.priceUSD : 50,
                        quantity: 1,
                        image: firstProd?.images?.[0] || '/src/assets/images/product_cubreasiento_cuero_deluxe_1791205480107.jpg'
                      }
                    ]);
                  }}
                  className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-3 py-1 rounded-lg transition-colors"
                >
                  + Agregar Otro Producto
                </button>
              </div>

              {newOrderItems.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Selector de catálogo */}
                    <div className="flex-1">
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = products.find(p => p.id === val);
                          const copy = [...newOrderItems];
                          if (found) {
                            copy[idx].productId = found.id;
                            copy[idx].productName = found.name;
                            copy[idx].price = found.priceUSD;
                            copy[idx].image = found.images?.[0] || '';
                          } else if (val === 'custom') {
                            copy[idx].productId = 'manual-' + Date.now();
                          }
                          setNewOrderItems(copy);
                        }}
                        value={products.some(p => p.id === item.productId) ? item.productId : 'custom'}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold mb-1"
                      >
                        <option value="custom">✏️ Personalizado (Escribir abajo)</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>📦 {p.name} - ${p.priceUSD} USD</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={e => {
                          const copy = [...newOrderItems];
                          copy[idx].productName = e.target.value;
                          setNewOrderItems(copy);
                        }}
                        placeholder="Nombre o detalle del producto"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-center">
                        <label className="text-[10px] text-slate-500 block mb-0.5 font-medium">Cant.</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => {
                            const copy = [...newOrderItems];
                            copy[idx].quantity = Math.max(1, Number(e.target.value) || 1);
                            setNewOrderItems(copy);
                          }}
                          className="w-14 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-center font-bold"
                        />
                      </div>
                      <div className="text-center">
                        <label className="text-[10px] text-slate-500 block mb-0.5 font-medium">Precio USD</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => {
                            const copy = [...newOrderItems];
                            copy[idx].price = Math.max(0, Number(e.target.value) || 0);
                            setNewOrderItems(copy);
                          }}
                          className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-center font-bold"
                        />
                      </div>
                      <div className="text-right w-24 pt-3">
                        <span className="font-extrabold text-blue-600 text-xs">$ {Math.round(item.price * item.quantity * 1250).toLocaleString('es-AR')}</span>
                      </div>
                      {newOrderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setNewOrderItems(newOrderItems.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg mt-3 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-baseline pt-2">
                <span className="font-bold text-slate-700 text-xs">Total del Pedido (ARS):</span>
                <div className="text-right">
                  <span className="text-xl font-black text-blue-600">
                    $ {Math.round(newOrderItems.reduce((sum, it) => sum + (it.price * it.quantity), 0) * 1250).toLocaleString('es-AR')} ARS
                  </span>
                </div>
              </div>
            </div>

            {/* Estado y Forma de Pago */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estado Inicial del Pedido</label>
                <select
                  value={newOrderStatus}
                  onChange={e => setNewOrderStatus(e.target.value as OrderStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold"
                >
                  <option value="Pendiente">Pendiente (Por Cobrar)</option>
                  <option value="Pagado">Pagado</option>
                  <option value="En Confección">En Preparación</option>
                  <option value="Despachado">Despachado</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Forma de Pago</label>
                <select
                  value={newOrderPaymentMethod}
                  onChange={e => setNewOrderPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold"
                >
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="efectivo">Efectivo / Mostrador</option>
                  <option value="mercadopago">MercadoPago</option>
                  <option value="tarjeta">Tarjeta Débito/Crédito</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1">Notas Internas o Instrucciones Especiales</label>
              <textarea
                value={newOrderNotes}
                onChange={e => setNewOrderNotes(e.target.value)}
                placeholder="Ej: Seña del 50% recibida por transferencia. Cliente retira en local el viernes."
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" /> Guardar y Crear Pedido
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: NUEVA COTIZACIÓN */}
      {showNewQuotationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <form onSubmit={handleCreateQuotation} className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="text-blue-600 w-5 h-5" /> Crear Cotización / Presupuesto
              </h3>
              <button type="button" onClick={() => setShowNewQuotationModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Cliente / Contacto *</label>
                <input required type="text" value={qCustomerName} onChange={e => setQCustomerName(e.target.value)} placeholder="Ej: Dr. Fernando Silva" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Empresa / Razón Social (Opcional)</label>
                <input type="text" value={qCustomerCompany} onChange={e => setQCustomerCompany(e.target.value)} placeholder="Ej: Logística Rápida S.A." className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">RUT / CUIT del Cliente</label>
                <input type="text" value={qCustomerRut} onChange={e => setQCustomerRut(e.target.value)} placeholder="Ej: 21.948.332.0019" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                <input type="text" value={qCustomerPhone} onChange={e => setQCustomerPhone(e.target.value)} placeholder="Ej: +5491122334455" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input type="email" value={qCustomerEmail} onChange={e => setQCustomerEmail(e.target.value)} placeholder="cliente@empresa.com" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Válido Hasta</label>
                <input type="date" value={qValidUntil} onChange={e => setQValidUntil(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Marca Auto</label>
                <input type="text" value={qCarBrand} onChange={e => setQCarBrand(e.target.value)} placeholder="Ej: Toyota" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Modelo Auto</label>
                <input type="text" value={qCarModel} onChange={e => setQCarModel(e.target.value)} placeholder="Ej: Hilux SRV" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Año</label>
                <input type="text" value={qCarYear} onChange={e => setQCarYear(e.target.value)} placeholder="Ej: 2024" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900" />
              </div>
            </div>

            {/* Ítems Presupuestados */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-xs">Ítems a Cotizar</span>
                <button
                  type="button"
                  onClick={() => setQItems([...qItems, { description: 'Nuevo Producto / Servicio', quantity: 1, unitPrice: 100, total: 100 }])}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-blue-600 font-bold px-3 py-1 rounded-lg"
                >
                  + Agregar Ítem
                </button>
              </div>

              {qItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => {
                      const copy = [...qItems];
                      copy[idx].description = e.target.value;
                      setQItems(copy);
                    }}
                    placeholder="Descripción del ítem"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => {
                      const copy = [...qItems];
                      const q = Number(e.target.value) || 1;
                      copy[idx].quantity = q;
                      copy[idx].total = q * copy[idx].unitPrice;
                      setQItems(copy);
                    }}
                    className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-center font-bold"
                  />
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={e => {
                      const copy = [...qItems];
                      const p = Number(e.target.value) || 0;
                      copy[idx].unitPrice = p;
                      copy[idx].total = copy[idx].quantity * p;
                      setQItems(copy);
                    }}
                    placeholder="Precio"
                    className="w-24 bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-bold"
                  />
                  <span className="font-bold text-slate-800 w-24 text-right">$ {Math.round(item.total * 1250).toLocaleString('es-AR')}</span>
                  {qItems.length > 1 && (
                    <button type="button" onClick={() => setQItems(qItems.filter((_, i) => i !== idx))} className="p-1 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  )}
                </div>
              ))}

              <div className="flex justify-between items-baseline pt-2">
                <span className="font-bold text-slate-700 text-xs">Total Cotizado (ARS):</span>
                <span className="text-lg font-extrabold text-blue-600">
                  $ {Math.round(qItems.reduce((sum, it) => sum + it.total, 0) * 1250).toLocaleString('es-AR')} ARS
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1">Notas del Presupuesto</label>
              <textarea value={qNotes} onChange={e => setQNotes(e.target.value)} rows={2} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800" />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowNewQuotationModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Guardar Cotización
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDITAR COTIZACIÓN */}
      {editingQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">Editar Cotización {editingQuotation.quotationNumber}</h3>
              <button onClick={() => setEditingQuotation(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5"/></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Cliente</label>
                <input type="text" value={editingQuotation.customerName} onChange={e => setEditingQuotation({...editingQuotation, customerName: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input type="text" value={editingQuotation.customerPhone} onChange={e => setEditingQuotation({...editingQuotation, customerPhone: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">RUT / CUIT</label>
                  <input type="text" value={editingQuotation.customerRut || ''} onChange={e => setEditingQuotation({...editingQuotation, customerRut: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monto Total USD</label>
                  <input type="number" value={editingQuotation.totalUSD} onChange={e => setEditingQuotation({...editingQuotation, totalUSD: Number(e.target.value), totalARS: Number(e.target.value) * 1250})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado</label>
                  <select value={editingQuotation.status} onChange={e => setEditingQuotation({...editingQuotation, status: e.target.value as any})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold">
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="Rechazada">Rechazada</option>
                    <option value="Vencida">Vencida</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas</label>
                <textarea value={editingQuotation.notes || ''} onChange={e => setEditingQuotation({...editingQuotation, notes: e.target.value})} rows={2} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setEditingQuotation(null)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
              <button onClick={() => {
                updateQuotation(editingQuotation.id, editingQuotation);
                setEditingQuotation(null);
                triggerToast('Cotización actualizada');
              }} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR VENTA / PEDIDO */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="text-blue-600 w-5 h-5" /> Editar Venta #{editingOrder.orderNumber || editingOrder.id}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Modifica los datos del cliente, estado o monto de la compra.</p>
              </div>
              <button onClick={() => setEditingOrder(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Cliente</label>
                  <input type="text" value={editOrderCustomerName} onChange={e => setEditOrderCustomerName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input type="text" value={editOrderCustomerPhone} onChange={e => setEditOrderCustomerPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" value={editOrderCustomerEmail} onChange={e => setEditOrderCustomerEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección / Envío</label>
                  <input type="text" value={editOrderCustomerAddress} onChange={e => setEditOrderCustomerAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estado</label>
                  <select value={editOrderStatus} onChange={e => setEditOrderStatus(e.target.value as OrderStatus)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold">
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                    <option value="En Confección">En Preparación</option>
                    <option value="Despachado">Despachado</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total (USD)</label>
                  <input type="number" value={editOrderTotalUSD} onChange={e => setEditOrderTotalUSD(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total (ARS)</label>
                  <input type="number" value={editOrderTotalARS} onChange={e => setEditOrderTotalARS(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas Internas</label>
                <textarea value={editOrderNotes} onChange={e => setEditOrderNotes(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setEditingOrder(null)} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
              <button onClick={handleSaveOrder} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2">
                <Check className="w-4 h-4" /> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO CLIENTE */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <form onSubmit={e => {
            e.preventDefault();
            if (!newUserName.trim() || !newUserEmail.trim()) return alert('Nombre y email requeridos');
            
            adminAddUser({
              name: newUserName.trim(),
              email: newUserEmail.trim(),
              phone: newUserPhone.trim(),
              address: newUserAddress.trim() || undefined,
              city: newUserCity.trim() || undefined,
              role: newUserRole,
              vehicles: [],
              status: newUserStatus,
            }, newUserPassword);

            setShowNewUserModal(false);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPhone('');
            setNewUserAddress('');
            setNewUserCity('');
            setNewUserRole('customer');
            setNewUserStatus('Activo');
            setNewUserPassword('cliente123');
            triggerToast('Cliente registrado con éxito en el sistema');
          }} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="text-blue-600 w-5 h-5" /> Agregar Nuevo Cliente
            </h3>
            
            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                  <input required type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Ej: Marcela Bianchi" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
                  <input required type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="marcela@correo.com" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                  <input type="text" value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} placeholder="+598 99 123 456" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ciudad / Localidad</label>
                  <input type="text" value={newUserCity} onChange={e => setNewUserCity(e.target.value)} placeholder="Montevideo, Pocitos" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección de Entrega</label>
                <input type="text" value={newUserAddress} onChange={e => setNewUserAddress(e.target.value)} placeholder="Av. Rivera 2340, Apto 302" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-blue-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rol</label>
                  <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as any)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold">
                    <option value="customer">Cliente Estándar</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado de la Cuenta</label>
                  <select value={newUserStatus} onChange={e => setNewUserStatus(e.target.value as any)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold">
                    <option value="Activo">Activo (Aprobado)</option>
                    <option value="Pendiente">Pendiente de Aprobación</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contraseña Inicial</label>
                <input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowNewUserModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-colors">Crear Cliente</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDITAR CLIENTE */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-auto">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="text-blue-600 w-5 h-5" /> Editar Cliente
            </h3>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                <input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                <input type="text" value={editingUser.phone} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección de Entrega</label>
                <input type="text" value={editingUser.address || ''} onChange={e => setEditingUser({...editingUser, address: e.target.value})} placeholder="Calle y número" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ciudad</label>
                <input type="text" value={editingUser.city || ''} onChange={e => setEditingUser({...editingUser, city: e.target.value})} placeholder="Ciudad o depto" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rol</label>
                  <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
                    <option value="customer">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado de Acceso</label>
                  <select value={editingUser.status || 'Activo'} onChange={e => setEditingUser({...editingUser, status: e.target.value as any})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
                    <option value="Activo">Activo (Aprobado)</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="Suspendido">Suspendido</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
              <button onClick={() => {
                adminUpdateUser(editingUser.id, editingUser);
                setEditingUser(null);
                triggerToast('Cliente actualizado');
              }} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-colors">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA CATEGORÍA */}
      {showNewCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="text-blue-500 w-5 h-5" /> Nueva Categoría
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre de la Categoría</label>
              <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Ej: Accesorios Deportivos" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
              <textarea value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} placeholder="Breve descripción del tipo de productos..." className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 outline-none" rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowNewCatModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
              <button onClick={() => {
                if (!newCatName.trim()) return alert('Escribe un nombre para la categoría');
                addCategory(newCatName.trim(), newCatDesc.trim());
                setShowNewCatModal(false);
                triggerToast('¡Categoría creada con éxito!');
              }} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Guardar Categoría
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA MARCA */}
      {showNewBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Car className="text-blue-500 w-5 h-5" /> Nueva Marca
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre de la Marca</label>
              <input type="text" value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder="Ej: Ford, Honda, BMW..." className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-blue-500 outline-none" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowNewBrandModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
              <button onClick={() => {
                if (!newBrandName.trim()) return alert('Ingresa un nombre');
                addBrand(newBrandName.trim());
                setShowNewBrandModal(false);
                triggerToast('¡Marca creada con éxito!');
              }} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Guardar Marca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO ATRIBUTO DE VARIANTE */}
      {showNewVariantTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <List className="text-blue-500 w-5 h-5" /> Nuevo Atributo de Variante
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre (ej: Color, Talle, Material)</label>
              <input type="text" value={newVariantTypeName} onChange={e => setNewVariantTypeName(e.target.value)} placeholder="Ej: Color" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opciones (separadas por coma)</label>
              <input type="text" value={newVariantTypeOptions} onChange={e => setNewVariantTypeOptions(e.target.value)} placeholder="Ej: Negro, Gris, Beige, Rojo" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 outline-none" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowNewVariantTypeModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
              <button onClick={() => {
                if (!newVariantTypeName.trim()) return alert('Ingresa un nombre');
                const opts = newVariantTypeOptions.split(',').map(s => s.trim()).filter(Boolean);
                addVariantType(newVariantTypeName.trim(), opts.length > 0 ? opts : ['Estándar']);
                setShowNewVariantTypeModal(false);
                triggerToast('¡Atributo creado con éxito!');
              }} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Guardar Atributo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA RESEÑA */}
      {showNewReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="text-blue-500 w-5 h-5" /> Nueva Reseña de Cliente
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Cliente</label>
                <input type="text" value={newReviewAuthor} onChange={e => setNewReviewAuthor(e.target.value)} placeholder="Ej: Juan Pérez" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Modelo de Auto</label>
                <input type="text" value={newReviewCar} onChange={e => setNewReviewCar(e.target.value)} placeholder="Ej: Toyota Hilux 2023" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Calificación</label>
              <select value={newReviewRating} onChange={e => setNewReviewRating(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900">
                <option value={5}>⭐⭐⭐⭐⭐ (5 Estrellas)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Estrellas)</option>
                <option value={3}>⭐⭐⭐ (3 Estrellas)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Comentario</label>
              <textarea value={newReviewComment} onChange={e => setNewReviewComment(e.target.value)} placeholder="Excelente producto, calce perfecto..." className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800" rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowNewReviewModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
              <button onClick={() => {
                if (!newReviewAuthor.trim() || !newReviewComment.trim()) return alert('Completa los campos obligatorios');
                addReview({
                  author: newReviewAuthor.trim(),
                  carModel: newReviewCar.trim() || 'Vehículo Universal',
                  comment: newReviewComment.trim(),
                  rating: newReviewRating,
                });
                setShowNewReviewModal(false);
                triggerToast('¡Reseña creada con éxito!');
              }} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Guardar Reseña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT EDIT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative my-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{isEditingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Nombre</label>
                  <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">SKU</label>
                  <input type="text" value={prodSku} onChange={e => setProdSku(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Categoría</label>
                  <select value={prodCategory} onChange={e => setProdCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors">
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Stock Disponible (Unidades)</label>
                  <input type="number" value={prodStock} onChange={e => setProdStock(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors" />
                </div>
              </div>

              {/* Selector de Moneda y Precio (ARS o USD sin conversión forzada) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Moneda del Producto
                    </label>
                    <span className="text-[11px] text-slate-500">Seleccioná si cobrás en Pesos Argentinos o en Dólares</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setProdCurrency('ARS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        prodCurrency === 'ARS'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>🇦🇷 Pesos ARG ($)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProdCurrency('USD')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        prodCurrency === 'USD'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>🇺🇸 Dólares (US$)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {prodCurrency === 'ARS' ? 'Precio en Pesos Argentinos (ARS $)' : 'Precio en Dólares (USD US$)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-600">
                      {prodCurrency === 'ARS' ? '$' : 'US$'}
                    </span>
                    <input
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      placeholder={prodCurrency === 'ARS' ? 'Ej: 150000' : 'Ej: 120'}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-4 py-2.5 text-base font-bold text-slate-900 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {prodCurrency === 'ARS'
                      ? '✓ Se guardará y mostrará directamente en Pesos Argentinos ($) en el catálogo, carrito y checkout sin conversión automática.'
                      : '✓ Se guardará y mostrará con el símbolo de dólares (US$) en el catálogo, carrito y checkout.'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Marcas Compatibles (separadas por coma)</label>
                <input type="text" value={prodBrands} onChange={e => setProdBrands(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 outline-none transition-colors" placeholder="Toyota, VW, Universal..." />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Imágenes del Producto</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-colors whitespace-nowrap flex items-center gap-1.5">
                      <Upload className="w-4 h-4" /> Subir Imágenes
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              let width = img.width; let height = img.height;
                              const MAX = 600;
                              if(width > height) { if(width > MAX) { height *= MAX / width; width = MAX; } }
                              else { if(height > MAX) { width *= MAX / height; height = MAX; } }
                              canvas.width = width; canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(img, 0, 0, width, height);
                              setProdImages(prev => [...prev, canvas.toDataURL('image/jpeg', 0.8)]);
                            };
                            img.src = ev.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        });
                      }} />
                    </label>
                    <span className="text-[11px] text-slate-500">Puedes subir múltiples fotos desde tu equipo.</span>
                  </div>
                  
                  {prodImages.length > 0 && (
                    <div className="flex gap-2.5 overflow-x-auto py-2">
                      {prodImages.map((img, i) => (
                        <div key={i} className="relative group shrink-0">
                          <img src={img} className="w-20 h-20 object-cover rounded-xl border border-slate-300 shadow-sm" />
                          <button 
                            type="button" 
                            onClick={() => setProdImages(prodImages.filter((_, idx) => idx !== i))} 
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-blue-600/90 text-white text-[9px] text-center uppercase font-bold py-0.5 rounded-b-xl">Portada</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!prodImages.length && prodImage && (
                    <div className="flex items-center gap-2 mt-1">
                      <img src={prodImage} className="w-16 h-16 object-cover rounded-lg border border-slate-300 opacity-50" />
                      <span className="text-[10px] text-slate-500">Imagen actual (URL)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Video del Producto (Subir desde PC o ingresar URL) */}
              <div>
                <label className="block text-xs text-slate-700 font-semibold mb-1">
                  Video Demostrativo del Producto (Opcional)
                </label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center gap-2">
                      <Video className="w-4 h-4 text-red-400" />
                      <span>{isUploadingVideo ? 'Procesando video...' : 'Subir Video desde tu Computadora'}</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={isUploadingVideo}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploadingVideo(true);
                          try {
                            const key = `prod_vid_${Date.now()}`;
                            const idbKey = await saveMediaBlob(key, file);
                            setProdVideo(idbKey);
                            triggerToast('¡Video cargado y guardado correctamente!');
                          } catch (err) {
                            console.error('Error guardando video:', err);
                            triggerToast('Error al procesar el archivo de video.');
                          } finally {
                            setIsUploadingVideo(false);
                          }
                        }}
                      />
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Admite MP4, WebM, MOV de tu ordenador.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">O pegar enlace de video:</span>
                    <input
                      type="text"
                      value={prodVideo.startsWith('idb:') ? '' : prodVideo}
                      placeholder={prodVideo.startsWith('idb:') ? 'Video subido desde tu ordenador' : 'https://ejemplo.com/video.mp4 o YouTube'}
                      onChange={(e) => setProdVideo(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Previsualización del video cargado */}
                  {prodVideo && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-black mt-2 max-w-sm">
                      <VideoPlayer src={prodVideo} controls className="w-full h-44" />
                      <button
                        type="button"
                        onClick={() => setProdVideo('')}
                        className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-colors z-10"
                        title="Quitar video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                        {prodVideo.startsWith('idb:') ? 'Archivo local de la PC' : 'Enlace web'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs text-slate-600 font-bold">Variantes / Tipos</label>
                  <button onClick={() => setProdVariants([...prodVariants, { id: 'var-'+Date.now(), name: 'Nuevo Tipo', stock: 10, priceExtraUSD: 0, image: '' }])} className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-900 px-3 py-1.5 rounded-xl transition-colors font-semibold flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Añadir Tipo
                  </button>
                </div>
                {prodVariants.map((v, i) => (
                  <div key={v.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-3 flex flex-col gap-3 relative">
                    <button onClick={() => setProdVariants(prodVariants.filter(vari => vari.id !== v.id))} className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                    <div className="grid grid-cols-2 gap-3 pr-8">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Nombre (ej: Rojo, XL)</label>
                        <input type="text" value={v.name} onChange={e => setProdVariants(prodVariants.map(pv => pv.id === v.id ? {...pv, name: e.target.value} : pv))} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-900" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Stock de variante</label>
                        <input type="number" value={v.stock} onChange={e => setProdVariants(prodVariants.map(pv => pv.id === v.id ? {...pv, stock: Number(e.target.value)} : pv))} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-900" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Extra Precio (USD)</label>
                        <input type="number" value={v.priceExtraUSD} onChange={e => setProdVariants(prodVariants.map(pv => pv.id === v.id ? {...pv, priceExtraUSD: Number(e.target.value)} : pv))} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-900" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Imagen Específica (Opcional)</label>
                        <input type="text" placeholder="URL de foto..." value={v.image || ''} onChange={e => setProdVariants(prodVariants.map(pv => pv.id === v.id ? {...pv, image: e.target.value} : pv))} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-900" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end border-t border-slate-200 pt-6">
              <button onClick={() => setShowProductModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={handleSaveProduct} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-200 transition-colors flex items-center gap-2">
                <Check className="w-4 h-4" /> Guardar Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
