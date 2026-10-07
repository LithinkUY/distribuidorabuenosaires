import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  User,
  Phone,
  MapPin,
  Trash2,
  Package,
  LogOut,
  CheckCircle2,
  Download,
  Lock,
  KeyRound,
  AlertTriangle,
  Eye,
  EyeOff,
  Check,
  Clock,
} from 'lucide-react';
import { OrderStatus } from '../../types';

export const ProfileModal: React.FC = () => {
  const {
    currentUser,
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateUserProfile,
    logoutUser,
    orders,
    formatPrice,
    exportOrderPDF,
    changeUserPassword,
    deleteUserAccount,
    storeSettings,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'security'>('orders');

  // Form states for profile
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Security / Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isProfileModalOpen || !currentUser) return null;

  // Filter orders for this customer (by email, phone, or customer name)
  const userOrders = orders.filter((o) => {
    const emailMatch = currentUser.email && o.customerEmail?.toLowerCase() === currentUser.email.toLowerCase();
    const nameMatch = currentUser.name && o.customerName?.toLowerCase() === currentUser.name.toLowerCase();
    const phoneMatch = currentUser.phone && o.customerPhone && currentUser.phone.replace(/\D/g, '') === o.customerPhone.replace(/\D/g, '');
    return emailMatch || nameMatch || phoneMatch;
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      address,
      city,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setPasswordFeedback({ type: 'error', message: 'La contraseña debe tener al menos 4 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Las contraseñas no coinciden. Intenta de nuevo.' });
      return;
    }

    const success = changeUserPassword(currentUser.id, newPassword);
    if (success) {
      setPasswordFeedback({ type: 'success', message: '¡Tu contraseña ha sido actualizada exitosamente!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordFeedback(null), 3000);
    } else {
      setPasswordFeedback({ type: 'error', message: 'Ocurrió un error al actualizar la contraseña.' });
    }
  };

  const handleDeleteMyAccount = () => {
    deleteUserAccount(currentUser.id);
    setShowDeleteConfirm(false);
    setIsProfileModalOpen(false);
  };

  // Helper for order status timeline
  const ORDER_STEPS: { status: OrderStatus; label: string; step: number }[] = [
    { status: 'Pendiente', label: '1. Pedido Recibido', step: 1 },
    { status: 'Pagado', label: '2. Pago Confirmado', step: 2 },
    { status: 'En Confección', label: '3. En Preparación / Empaque', step: 3 },
    { status: 'Despachado', label: '4. Despachado / Envío', step: 4 },
    { status: 'Entregado', label: '5. Entregado', step: 5 },
  ];

  const getStepNumber = (st: OrderStatus): number => {
    switch (st) {
      case 'Pendiente': return 1;
      case 'Pagado': return 2;
      case 'En Confección': return 3;
      case 'Despachado': return 4;
      case 'Entregado': return 5;
      case 'Cancelado': return 0;
      default: return 1;
    }
  };

  const displayStatusLabel = (st: OrderStatus): string => {
    if (st === 'En Confección') return 'En Preparación';
    return st;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto text-slate-900">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-base font-mono shadow-sm">
              {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-slate-900">
                  {currentUser.name}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  currentUser.role === 'admin'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {currentUser.role === 'admin' ? 'Administrador' : 'Cliente Verificado'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {currentUser.email} {currentUser.phone ? `· ${currentUser.phone}` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logoutUser();
                setIsProfileModalOpen(false);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-bold overflow-x-auto">
          {[
            { id: 'orders', label: 'Mis Pedidos & Facturación', icon: Package, badge: userOrders.length },
            { id: 'profile', label: 'Datos Personales & Envío', icon: User },
            { id: 'security', label: 'Seguridad & Contraseña', icon: Lock },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {typeof t.badge === 'number' && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          
          {/* ================= TAB 1: MIS PEDIDOS ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Tus Pedidos Realizados
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    El estado de tus pedidos se actualiza en tiempo real cuando procesamos tu compra. Puedes descargar tu comprobante en PDF con datos fiscales en cualquier momento.
                  </p>
                </div>
              </div>

              {userOrders.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50 border border-slate-200 rounded-3xl">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">Aún no tienes pedidos registrados</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Cuando realices una compra de fundas o accesorios en nuestra distribuidora, podrás seguir el estado de tu pedido aquí y descargar tus facturas en PDF.
                  </p>
                  <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Explorar Catálogo de Productos
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {userOrders.map((ord) => {
                    const currentStepNum = getStepNumber(ord.status);
                    const isCancelled = ord.status === 'Cancelado';

                    return (
                      <div
                        key={ord.id}
                        className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-4"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-blue-700 font-mono">
                              #{ord.orderNumber.slice(-4)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-slate-900 text-sm font-mono font-bold">
                                  Orden {ord.orderNumber}
                                </strong>
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  ord.status === 'Entregado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  ord.status === 'Pagado' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                  ord.status === 'En Confección' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  ord.status === 'Despachado' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                  ord.status === 'Cancelado' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                  'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  ● {displayStatusLabel(ord.status)}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                Fecha: {new Date(ord.createdAt).toLocaleDateString('es-UY', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* DOWNLOAD PDF BUTTON */}
                            <button
                              onClick={() => exportOrderPDF(ord)}
                              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                              title="Descargar comprobante de compra en formato PDF membretado"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Descargar PDF</span>
                            </button>

                            {/* WHATSAPP SUPPORT FOR THIS ORDER */}
                            <a
                              href={`https://wa.me/${(storeSettings?.whatsappNumber || '5491112345678').replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Hola, soy ${currentUser.name}. Tengo una consulta sobre mi pedido #${ord.orderNumber}.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                              title="Consultar por WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                          </div>
                        </div>

                        {/* Real-time Order Progress Pipeline */}
                        {!isCancelled ? (
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                              Seguimiento de Estado en Vivo:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              {ORDER_STEPS.map((st) => {
                                const isCompleted = currentStepNum >= st.step;
                                const isCurrent = currentStepNum === st.step;
                                return (
                                  <div
                                    key={st.step}
                                    className={`p-2 rounded-xl text-center border transition-all ${
                                      isCurrent
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold scale-[1.02]'
                                        : isCompleted
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                                        : 'bg-white text-slate-400 border-slate-200'
                                    }`}
                                  >
                                    <div className="text-[10px] flex items-center justify-center gap-1">
                                      {isCompleted ? <Check className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-slate-400" />}
                                      <span>{st.label}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Este pedido fue cancelado. Comunícate con atención al cliente si tienes dudas.</span>
                          </div>
                        )}

                        {/* Order Details & Items */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                          
                          {/* Col 1 & 2: Items */}
                          <div className="md:col-span-2 space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 block">Artículos Incluidos:</span>
                            <div className="space-y-2">
                              {ord.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                                >
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.productName}
                                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                                      <Package className="w-6 h-6 text-slate-400" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">
                                      {item.quantity}x {item.productName}
                                    </p>
                                    {item.customization && (
                                      <p className="text-[10px] text-slate-500">
                                        Detalle: {item.customization.material || 'Estándar'} 
                                        {item.customization.stitchingColor && ` · Color: ${item.customization.stitchingColor}`}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right text-xs font-mono font-bold text-slate-700 shrink-0">
                                    {item.currency === 'USD'
                                      ? `US$ ${Math.round(item.price * item.quantity).toLocaleString('en-US')}`
                                      : `$ ${Math.round(item.price * item.quantity).toLocaleString('es-AR')} ARS`}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Col 3: Shipping & Summary */}
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex flex-col justify-between text-xs space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Entrega / Envío
                              </span>
                              <div className="text-slate-600 space-y-0.5 text-[11px]">
                                <p className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{ord.customerAddress || 'Retiro en Sucursal'}</span>
                                </p>
                                {ord.customerCity && <p className="text-slate-500 pl-4">{ord.customerCity}</p>}
                              </div>

                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-3 mb-1">
                                Medio de Pago
                              </span>
                              <span className="text-xs text-slate-800 font-medium capitalize">
                                {ord.paymentMethod}
                              </span>
                            </div>

                            <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-600">Total Orden:</span>
                              <span className="text-base font-mono font-bold text-blue-600">
                                {ord.paidCurrency === 'USD'
                                  ? `US$ ${Math.round(ord.totalUSD).toLocaleString('en-US')}`
                                  : `$ ${Math.round(ord.totalARS || (ord.totalUSD || 0) * 1250).toLocaleString('es-AR')} ARS`}
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: DATOS PERSONALES & ENVÍO ================= */}
          {activeTab === 'profile' && (
            <div className="max-w-xl space-y-6">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Datos Personales y Dirección
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Esta información se utiliza para preparar tus pedidos y coordinar envíos o entregas en sucursal.
                </p>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Tus datos han sido actualizados con éxito.</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+598 99 123 456"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Correo Electrónico (Solo Lectura)</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Para cambiar tu correo de acceso contacta al administrador.</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dirección de Entrega Predeterminada</label>
                  <input
                    type="text"
                    placeholder="Calle, Número, Apto / Piso"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ciudad / Localidad</label>
                  <input
                    type="text"
                    placeholder="Ej. Montevideo, CABA, Canelones..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    Guardar Cambios de Perfil
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 3: SEGURIDAD & CONTRASEÑA & BORRAR CUENTA ================= */}
          {activeTab === 'security' && (
            <div className="max-w-xl space-y-8">
              
              {/* Sección: Cambiar Contraseña */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-blue-600" />
                    Cambiar Contraseña
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modifica tu clave de acceso para proteger tu cuenta y tus compras.
                  </p>
                </div>

                {passwordFeedback && (
                  <div
                    className={`p-3 rounded-2xl text-xs flex items-center gap-2 animate-fade-in ${
                      passwordFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {passwordFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span>{passwordFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nueva Contraseña (mínimo 4 caracteres) *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Confirmar Nueva Contraseña *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                    >
                      Actualizar Mi Contraseña
                    </button>
                  </div>
                </form>
              </div>

              {/* Sección: Zona de Peligro / Borrar Cuenta */}
              <div className="border-t border-slate-200 pt-6 space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-rose-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Zona de Peligro: Eliminar Mi Cuenta
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Al borrar tu cuenta, se eliminarán tus datos personales de acceso de forma permanente.
                  </p>
                </div>

                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Dar de Baja Mi Cuenta</span>
                  </button>
                ) : (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-xs font-bold text-rose-900 block">¿Confirmas la eliminación permanente?</strong>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          Esta acción cerrará tu sesión inmediatamente y eliminará tu perfil de usuario.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleDeleteMyAccount}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                      >
                        Sí, Eliminar Definitivamente
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
