import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    cartTotalUSD,
    cartTotalARS,
    isCartAllUSD,
    formatCartItemPrice,
    setIsCheckoutOpen,
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 text-slate-900 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
              <h2 className="font-display font-bold text-lg text-slate-900">
                Tu Carrito de Compras
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-display font-semibold text-base text-slate-800 mb-1">
                  Tu carrito está vacío
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mb-6">
                  Descubrí nuestros cubreasientos premium y alfombras 3D termoformadas para tu vehículo.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-50/40 transition-colors"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="p-3 bg-slate-100/80 border border-slate-200 rounded-xl flex gap-3 relative"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.productName}
                    referrerPolicy="no-referrer"
                    className="w-18 h-18 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 truncate mb-1">
                        {item.productName}
                      </h4>

                      {/* Customization metadata */}
                      {item.customization && (
                        <div className="text-[10px] text-slate-600 space-y-0.5 mb-1.5">
                          {item.customization.carBrand && (
                            <div>Auto: <strong className="text-slate-800">{item.customization.carBrand} {item.customization.carModel} ({item.customization.carYear})</strong></div>
                          )}
                          {item.customization.stitchingColor && (
                            <div>Costura: <strong className="text-slate-800">{item.customization.stitchingColor}</strong></div>
                          )}
                          {item.customization.material && (
                            <div>Material: <strong className="text-slate-800">{item.customization.material}</strong></div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-slate-900 text-[11px]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Item Total in Native Currency */}
                      <span className="font-mono font-bold text-xs text-slate-900 tabular-nums">
                        {formatCartItemPrice(item)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-slate-500 hover:text-blue-600 transition-colors self-start"
                    title="Eliminar del carrito"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-white space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-800 tabular-nums font-bold">
                    {isCartAllUSD
                      ? `US$ ${Math.round(cartTotalUSD).toLocaleString('en-US')}`
                      : `$ ${Math.round(cartTotalARS).toLocaleString('es-AR')}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío a Domicilio</span>
                  <span className="text-emerald-500 font-semibold">Gratis en todo el país</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200/80">
                  <span>Total Estimado</span>
                  <span className="font-mono text-lg text-slate-900 tabular-nums">
                    {isCartAllUSD
                      ? `US$ ${Math.round(cartTotalUSD).toLocaleString('en-US')}`
                      : `$ ${Math.round(cartTotalARS).toLocaleString('es-AR')}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Compra protegida y garantía de adaptación</span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-slate-900 font-bold text-xs rounded-xl shadow-lg shadow-blue-50/50 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Iniciar Compra Segura</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
