import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Save, CreditCard, Key } from 'lucide-react';

export const PaymentSettings: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useStore();
  
  const [settings, setSettings] = useState(storeSettings);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="text-blue-500 w-6 h-6" />
            Pasarelas de Pago y APIs
          </h2>
          <p className="text-slate-600 text-sm">Gestiona tus credenciales de MercadoPago, Stripe y PayPal.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        <div className="bg-[#009EE3]/10 border border-[#009EE3]/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-[#009EE3] font-bold flex items-center gap-2 mb-4 border-b border-[#009EE3]/20 pb-3">
            <Key className="w-4 h-4" /> Configuración de MercadoPago
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Public Key</label>
              <input 
                type="text" name="mercadopagoPublicKey" value={settings.mercadopagoPublicKey} onChange={handleChange} placeholder="TEST-..."
                className="w-full bg-white/50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-[#009EE3] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Access Token</label>
              <input 
                type="password" name="mercadopagoAccessToken" value={settings.mercadopagoAccessToken} onChange={handleChange} placeholder="TEST-..."
                className="w-full bg-white/50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-[#009EE3] outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#635BFF]/10 border border-[#635BFF]/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-[#635BFF] font-bold flex items-center gap-2 mb-4 border-b border-[#635BFF]/20 pb-3">
            <Key className="w-4 h-4" /> Configuración de Stripe
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Publishable Key</label>
              <input 
                type="text" name="stripePublicKey" value={settings.stripePublicKey} onChange={handleChange} placeholder="pk_test_..."
                className="w-full bg-white/50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-[#635BFF] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Secret Key</label>
              <input 
                type="password" name="stripeSecretKey" value={settings.stripeSecretKey} onChange={handleChange} placeholder="sk_test_..."
                className="w-full bg-white/50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-[#635BFF] outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          {isSaved && <span className="text-emerald-500 text-sm font-medium animate-pulse">¡Credenciales guardadas exitosamente!</span>}
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-50/40 transition-transform active:scale-95">
            <Save className="w-4 h-4" /> Guardar APIs
          </button>
        </div>
      </form>
    </div>
  );
};
