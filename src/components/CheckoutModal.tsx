import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { X, CheckCircle2, ShieldCheck, CreditCard, QrCode, Building, Banknote, ArrowRight, PhoneCall, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartTotalUSD,
    cartTotalARS,
    cartTotalUYU,
    currency,
    formatPrice,
    createOrder,
    storeSettings,
    isCartAllUSD,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+54 9 11 ');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'tarjeta' | 'transferencia' | 'efectivo'>('mercadopago');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const order = createOrder({
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        customerCity,
        carDetails: {
          brand: 'Distribuidora',
          model: 'Stock Inmediato',
          year: new Date().getFullYear().toString(),
        },
        items: cart,
        totalUSD: cartTotalUSD,
        totalARS: cartTotalARS,
        totalUYU: cartTotalUYU,
        paidCurrency: isCartAllUSD ? 'USD' : 'ARS',
        status: paymentMethod === 'tarjeta' || paymentMethod === 'mercadopago' ? 'Pagado' : 'Pendiente',
        paymentMethod,
        notes,
      });

      setIsProcessing(false);
      setCompletedOrder(order);

      // Fire confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#3b82f6', '#ffffff', '#22c55e'],
        });
      } catch (err) {
        console.error(err);
      }
    }, 800);
  };

  const handleSendWhatsAppOrder = (order: Order) => {
    const rawNumber = (storeSettings?.whatsappNumber || '5491112345678').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `¡Hola Distribuidora Buenos Aires! 👋 Acabo de realizar el pedido *#${order.orderNumber}* desde su tienda online.\n` +
      `• Cliente: ${order.customerName}\n` +
      `• Dirección de Entrega: ${order.customerAddress}, ${order.customerCity}\n` +
      `• Medio de Pago: ${order.paymentMethod.toUpperCase()}\n` +
      `• Total: ${order.paidCurrency === 'USD' ? `US$ ${order.totalUSD.toLocaleString('en-US')}` : `$ ${order.totalARS.toLocaleString('es-AR')} ARS`}\n` +
      `• Artículos: ${order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}\n` +
      (order.notes ? `• Observaciones: ${order.notes}\n` : '') +
      `Quedo a la espera de confirmación y fecha de entrega. ¡Muchas gracias!`
    );
    window.open(`https://wa.me/${rawNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto text-slate-900">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900">
                {completedOrder ? '¡Pedido Confirmado con Éxito!' : 'Finalizar Compra'}
              </h2>
              <span className="text-[11px] text-slate-500">
                Distribuidora Buenos Aires · Proceso de Compra Seguro y Rápido
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setCompletedOrder(null);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {completedOrder ? (
            /* Success View */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-600 font-semibold block mb-1">
                  Transacción Procesada
                </span>
                <h3 className="font-display font-extrabold text-2xl text-slate-900 mb-2">
                  ¡Gracias por tu compra, {completedOrder.customerName}!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Tu pedido ha sido registrado con el número{' '}
                  <strong className="text-slate-900 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {completedOrder.orderNumber}
                  </strong>
                  . Nuestro equipo ya está preparando tus productos para el despacho o retiro.
                </p>
              </div>

              {/* Order Summary Receipt Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left text-xs space-y-2.5">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Dirección de Entrega:</span>
                  <span className="text-slate-900 font-medium">
                    {completedOrder.customerAddress}, {completedOrder.customerCity}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Medio de Pago:</span>
                  <span className="text-slate-900 font-medium capitalize">
                    {completedOrder.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Estado:</span>
                  <span className="text-emerald-600 font-semibold">{completedOrder.status}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm">
                  <span className="text-slate-900">Total Abonado:</span>
                  <span className="font-mono text-blue-600 tabular-nums">
                    {completedOrder.paidCurrency === 'USD'
                      ? `US$ ${completedOrder.totalUSD.toLocaleString('en-US')}`
                      : `$ ${completedOrder.totalARS.toLocaleString('es-AR')} ARS`}
                  </span>
                </div>
              </div>

              {/* Primary action: Notify via WhatsApp */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <button
                  onClick={() => handleSendWhatsAppOrder(completedOrder)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Enviar Comprobante por WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setCompletedOrder(null);
                  }}
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-colors"
                >
                  Volver a la Tienda
                </button>
              </div>
            </div>
          ) : (
            /* Simple 2-Step Checkout Form View */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              
              {/* Step 1: Customer Details */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Datos del Comprador y Envío</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nombre y Apellido *</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Juan Pérez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="juan@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">WhatsApp / Teléfono *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+54 9 11 1234 5678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ciudad / Localidad *</label>
                    <input
                      type="text"
                      required
                      placeholder="Montevideo, CABA, Canelones, etc."
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dirección de Entrega *</label>
                    <input
                      type="text"
                      required
                      placeholder="Calle, Número, Apto o Punto de Retiro"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Gateway Selector */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>Selección de Medio de Pago</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Mercado Pago */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'mercadopago'
                        ? 'bg-blue-50/70 border-blue-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'mercadopago'}
                      onChange={() => setPaymentMethod('mercadopago')}
                      className="mt-1 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-blue-600" />
                          <span>Mercado Pago</span>
                        </strong>
                        <span className="text-[10px] text-blue-600 font-bold">QR / Saldo / Cuotas</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Procesamiento seguro e instantáneo online.
                      </p>
                    </div>
                  </label>

                  {/* Credit / Debit Card */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'tarjeta'
                        ? 'bg-blue-50/70 border-blue-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'tarjeta'}
                      onChange={() => setPaymentMethod('tarjeta')}
                      className="mt-1 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          <span>Tarjetas Visa / Mastercard</span>
                        </strong>
                        <span className="text-[10px] text-blue-600 font-bold">Débito y Crédito</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Aceptamos todas las tarjetas con acreditación al instante.
                      </p>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'transferencia'
                        ? 'bg-emerald-50/70 border-emerald-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'transferencia'}
                      onChange={() => setPaymentMethod('transferencia')}
                      className="mt-1 text-emerald-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Transferencia Bancaria</span>
                        </strong>
                        <span className="text-[10px] text-emerald-600 font-bold">10% OFF</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Cuentas BROU, Santander, Itaú o CBU / Alias en Argentina.
                      </p>
                    </div>
                  </label>

                  {/* Cash on pickup */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'efectivo'
                        ? 'bg-amber-50/70 border-amber-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'efectivo'}
                      onChange={() => setPaymentMethod('efectivo')}
                      className="mt-1 text-amber-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-amber-600" />
                          <span>Efectivo / Retiro en Sucursal</span>
                        </strong>
                        <span className="text-[10px] text-amber-600 font-semibold">Mostrador</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Abonás cuando retiras tus productos por nuestra distribuidora.
                      </p>
                    </div>
                  </label>

                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Notas o comentarios sobre el pedido o entrega (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Aclaración de horario para entrega, timbre, indicaciones especiales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Total & Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 block">
                    {isCartAllUSD ? 'Total a Pagar (USD):' : 'Total a Pagar (ARS):'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-extrabold text-2xl text-slate-900 tabular-nums">
                      {isCartAllUSD
                        ? `US$ ${Math.round(cartTotalUSD).toLocaleString('en-US')}`
                        : `$ ${cartTotalARS.toLocaleString('es-AR')}`}
                    </span>
                    {paymentMethod === 'transferencia' && (
                      <span className="text-[10px] text-emerald-600 font-bold">
                        (Aplica 10% descuento al transferir)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Procesando Compra...</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Confirmar y Finalizar Pedido</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
