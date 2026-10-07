import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Save, Palette, Image as ImageIcon, Building2, Phone, Mail, MapPin, CheckCircle, FileText } from 'lucide-react';

export const AppearanceSettings: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useStore();
  const [settings, setSettings] = useState(storeSettings);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 400;
          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setSettings({ ...settings, logoUrl: canvas.toDataURL('image/png', 0.8) });
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Palette className="text-blue-600 w-7 h-7" />
            Apariencia & Datos de la Empresa
          </h2>
          <p className="text-slate-600 text-sm mt-0.5">
            Personaliza el logotipo, los colores de tu marca y los datos fiscales que aparecen en los presupuestos y cotizaciones en PDF.
          </p>
        </div>
        {isSaved && (
          <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md">
            <CheckCircle className="w-4 h-4" /> ¡Guardado con éxito!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        
        {/* LOGO E IDENTIDAD VISUAL */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="text-slate-900 font-bold text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <ImageIcon className="w-5 h-5 text-blue-600" /> Logotipo e Imagen de Marca
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Comercial de la Tienda</label>
              <input
                type="text"
                name="businessName"
                value={settings.businessName}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 outline-none font-semibold"
                placeholder="Ej: Distribuidora BA"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp de Contacto Oficial</label>
              <input
                type="text"
                name="whatsappNumber"
                value={settings.whatsappNumber || ''}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 outline-none"
                placeholder="Ej: +5491112345678"
              />
            </div>

            <div className="md:col-span-2 space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Logotipo Oficial</label>
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {settings.logoUrl ? (
                  <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-sm flex items-center justify-center">
                    <img
                      src={settings.logoUrl}
                      alt="Logo"
                      style={{ width: `${settings.logoSize || 48}px` }}
                      className="object-contain max-h-24"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-white border border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-xs font-semibold text-center p-2">
                    Sin Logo
                  </div>
                )}
                <div className="flex-1 space-y-3 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 font-semibold shrink-0">Tamaño en pantalla: {settings.logoSize || 48}px</span>
                    <input
                      type="range"
                      name="logoSize"
                      min="24"
                      max="140"
                      value={settings.logoSize || 48}
                      onChange={handleChange}
                      className="flex-1 accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLORES DE LA TIENDA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="text-slate-900 font-bold text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Palette className="w-5 h-5 text-blue-600" /> Paleta de Colores de la Tienda
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Color Primario (Botones y Acentos)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="primaryColor"
                  value={settings.primaryColor || '#0055ff'}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={settings.primaryColor || '#0055ff'}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fondo del Menú Header</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="headerBgColor"
                  value={settings.headerBgColor || '#ffffff'}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  name="headerBgColor"
                  value={settings.headerBgColor || '#ffffff'}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Color del Texto en Header</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="headerTextColor"
                  value={settings.headerTextColor || '#1e293b'}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  name="headerTextColor"
                  value={settings.headerTextColor || '#1e293b'}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Color de Fondo del Footer</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="footerBgColor"
                  value={settings.footerBgColor || '#0a0f1d'}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  name="footerBgColor"
                  value={settings.footerBgColor || '#0a0f1d'}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none"
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, footerBgColor: '#0a0f1d', footerTextColor: '#94a3b8' })}
                  className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-bold hover:opacity-80"
                >
                  Oscuro
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, footerBgColor: '#1e293b', footerTextColor: '#cbd5e1' })}
                  className="text-[10px] bg-slate-700 text-white px-2 py-0.5 rounded font-bold hover:opacity-80"
                >
                  Pizarra
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, footerBgColor: '#ffffff', footerTextColor: '#475569' })}
                  className="text-[10px] bg-white text-slate-700 border border-slate-300 px-2 py-0.5 rounded font-bold hover:bg-slate-50"
                >
                  Blanco
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Color de Textos del Footer</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="footerTextColor"
                  value={settings.footerTextColor || '#94a3b8'}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                />
                <input
                  type="text"
                  name="footerTextColor"
                  value={settings.footerTextColor || '#94a3b8'}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* DATOS FISCALES Y DE LA EMPRESA (PARA COTIZACIONES Y FACTURAS PDF) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-slate-900 font-bold text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Datos Fiscales y de la Empresa (para PDFs de Cotizaciones)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Esta información se imprime en el membrete y encabezado de todas las cotizaciones y presupuestos en PDF.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Razón Social Legal</label>
              <input
                type="text"
                name="companyLegalName"
                value={settings.companyLegalName || ''}
                onChange={handleChange}
                placeholder="Ej: Distribuidora BA S.A.S."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">RUT / CUIT / Identificación Fiscal</label>
              <input
                type="text"
                name="companyRut"
                value={settings.companyRut || ''}
                onChange={handleChange}
                placeholder="Ej: 21.849.201.0018 o 30-71234567-9"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono de Oficina / Ventas</label>
              <input
                type="text"
                name="companyPhone"
                value={settings.companyPhone || ''}
                onChange={handleChange}
                placeholder="Ej: +54 9 11 1234-5678"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email de Facturación / Cotizaciones</label>
              <input
                type="email"
                name="companyEmail"
                value={settings.companyEmail || ''}
                onChange={handleChange}
                placeholder="Ej: ventas@lacasadelcubreasiento.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección Física / Taller</label>
              <input
                type="text"
                name="companyAddress"
                value={settings.companyAddress || ''}
                onChange={handleChange}
                placeholder="Ej: Av. Corrientes 1234"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ciudad y País</label>
              <input
                type="text"
                name="companyCity"
                value={settings.companyCity || ''}
                onChange={handleChange}
                placeholder="Ej: CABA, Buenos Aires, Argentina"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Términos y Condiciones del Presupuesto (al pie del PDF)</label>
              <textarea
                name="quotationTerms"
                value={settings.quotationTerms || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Ej: Validez del presupuesto: 15 días corridos. Precios expresados en USD o moneda local oficial. Confección en 5 a 7 días hábiles tras confirmación del pedido."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:border-blue-500 outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* BOTON GUARDAR */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20 text-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" /> Guardar Cambios de Apariencia
          </button>
        </div>
      </form>
    </div>
  );
};
