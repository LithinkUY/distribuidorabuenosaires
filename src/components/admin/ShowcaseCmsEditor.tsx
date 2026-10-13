import React from 'react';
import {
  ShowcaseSettings,
  ShowcaseBanner,
  ShowcaseCard,
  ShowcaseStep,
  ShowcaseTestimonial,
  resolveShowcase,
} from '../showcase/showcaseConfig';
import { Product } from '../../types';
import {
  Layers,
  Sparkles,
  Truck,
  MessageSquare,
  Factory,
  Image as ImageIcon,
  Upload,
  Link,
} from 'lucide-react';

interface ShowcaseCmsEditorProps {
  showcase?: Partial<ShowcaseSettings>;
  onChange: (updated: ShowcaseSettings) => void;
  products?: Product[];
}

export const ShowcaseCmsEditor: React.FC<ShowcaseCmsEditorProps> = ({
  showcase,
  onChange,
  products = [],
}) => {
  const cfg = resolveShowcase(showcase);

  const updateModels = (field: string, val: any) => {
    onChange({
      ...cfg,
      models: { ...cfg.models, [field]: val },
    });
  };

  const updateBanner = (index: number, field: keyof ShowcaseBanner, val: any) => {
    const updated = [...cfg.banners];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...cfg, banners: updated });
  };

  const handleBannerImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX = 1400;
        if (width > height && width > MAX) {
          height *= MAX / width;
          width = MAX;
        } else if (height > MAX) {
          width *= MAX / height;
          height = MAX;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        updateBanner(index, 'image', compressed);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const updateMaintenanceCard = (index: number, field: keyof ShowcaseCard, val: any) => {
    const updated = [...cfg.maintenance.cards];
    updated[index] = { ...updated[index], [field]: val };
    onChange({
      ...cfg,
      maintenance: { ...cfg.maintenance, cards: updated },
    });
  };

  const updateManufacturers = (field: string, val: any) => {
    onChange({
      ...cfg,
      manufacturers: { ...cfg.manufacturers, [field]: val },
    });
  };

  const updateStep = (index: number, field: keyof ShowcaseStep, val: any) => {
    const updated = [...cfg.manufacturers.steps];
    updated[index] = { ...updated[index], [field]: val };
    onChange({
      ...cfg,
      manufacturers: { ...cfg.manufacturers, steps: updated },
    });
  };

  const updateShipping = (field: string, val: any) => {
    onChange({
      ...cfg,
      shipping: { ...cfg.shipping, [field]: val },
    });
  };

  const updateTestimonial = (index: number, field: keyof ShowcaseTestimonial, val: any) => {
    const updated = [...cfg.testimonials.items];
    updated[index] = { ...updated[index], [field]: val };
    onChange({
      ...cfg,
      testimonials: { ...cfg.testimonials, items: updated },
    });
  };

  return (
    <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-sm space-y-8">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Diseño Catálogo Wix (Digital Fundas)</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          Personalizar Secciones y Efectos del Home
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Edita los textos, banners de categorías, tarjetas de mantenimiento, información de fábrica y testimonios del nuevo diseño.
        </p>
      </div>

      {/* 1. SECCIÓN MODELOS CON AJUSTE PERFECTO */}
      <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-red-600" />
          <span>1. Grilla: Modelos con Ajuste Perfecto</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Título de la Sección</label>
            <input
              type="text"
              value={cfg.models.title}
              onChange={(e) => updateModels('title', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Subtítulo (Opcional)</label>
            <input
              type="text"
              value={cfg.models.subtitle || ''}
              onChange={(e) => updateModels('subtitle', e.target.value)}
              placeholder="Ej. Fundas hechas a medida con calce original"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 2. BANNERS DE CATEGORÍAS (Alfombras, Volante, Lumbar) */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-red-600" />
          <span>2. Banners Destacados de Categorías</span>
        </h4>

        <div className="space-y-4">
          {cfg.banners.map((b, idx) => (
            <div key={b.id || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Banner #{idx + 1}: {b.title}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Posición: {b.layout === 'left' ? 'Imagen a la izquierda' : 'Imagen a la derecha'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Título del Banner</label>
                  <input
                    type="text"
                    value={b.title}
                    onChange={(e) => updateBanner(idx, 'title', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Texto del Botón</label>
                  <input
                    type="text"
                    value={b.buttonText}
                    onChange={(e) => updateBanner(idx, 'buttonText', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Descripción</label>
                <textarea
                  rows={2}
                  value={b.text}
                  onChange={(e) => updateBanner(idx, 'text', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              {/* Image URL & Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <img
                  src={b.image}
                  alt={b.title}
                  className="w-20 h-14 object-cover rounded-md border border-slate-300 shrink-0"
                />
                <div className="flex-1 w-full space-y-1">
                  <input
                    type="text"
                    value={b.image}
                    onChange={(e) => updateBanner(idx, 'image', e.target.value)}
                    placeholder="URL o ruta de imagen"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[11px] font-bold text-slate-700 cursor-pointer transition-colors">
                    <Upload className="w-3 h-3 text-red-600" />
                    <span>Cambiar imagen desde la PC</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleBannerImageUpload(idx, e)}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MANTENIMIENTO PRO */}
      <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-red-600" />
          <span>3. Mantenimiento Pro (Productos en Desarrollo)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {cfg.maintenance.cards.map((c, idx) => (
            <div key={c.id || idx} className="bg-white p-3 rounded-lg border border-slate-300 space-y-2">
              <span className="text-[10px] font-bold text-red-600 uppercase">Tarjeta #{idx + 1}</span>
              <input
                type="text"
                value={c.title}
                onChange={(e) => updateMaintenanceCard(idx, 'title', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-900"
              />
              <textarea
                rows={3}
                value={c.text}
                onChange={(e) => updateMaintenanceCard(idx, 'text', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. SOMOS FABRICANTES & PASOS DEL PEDIDO */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Factory className="w-4 h-4 text-red-600" />
          <span>4. Somos Fabricantes & Proceso del Pedido</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Título</label>
            <input
              type="text"
              value={cfg.manufacturers.title}
              onChange={(e) => updateManufacturers('title', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Detalles / WhatsApp</label>
            <input
              type="text"
              value={cfg.manufacturers.orderText}
              onChange={(e) => updateManufacturers('orderText', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Descripción de la Fábrica</label>
          <textarea
            rows={2}
            value={cfg.manufacturers.text}
            onChange={(e) => updateManufacturers('text', e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
          />
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {cfg.manufacturers.steps.map((st, idx) => (
            <div key={st.id || idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-700">Paso 0{idx + 1}</span>
              <input
                type="text"
                value={st.title}
                onChange={(e) => updateStep(idx, 'title', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900"
              />
              <textarea
                rows={2}
                value={st.text}
                onChange={(e) => updateStep(idx, 'text', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] text-slate-700"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 5. ENVÍOS ANDREANI */}
      <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Truck className="w-4 h-4 text-red-600" />
          <span>5. Logística & Envíos Andreani</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Título</label>
            <input
              type="text"
              value={cfg.shipping.title}
              onChange={(e) => updateShipping('title', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Texto del Botón</label>
            <input
              type="text"
              value={cfg.shipping.buttonText}
              onChange={(e) => updateShipping('buttonText', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Descripción de Envíos</label>
          <textarea
            rows={2}
            value={cfg.shipping.text}
            onChange={(e) => updateShipping('text', e.target.value)}
            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
          />
        </div>
      </div>

      {/* 6. TESTIMONIOS */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-red-600" />
          <span>6. Experiencias de los Usuarios (Testimonios)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {cfg.testimonials.items.map((ts, idx) => (
            <div key={ts.id || idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-600">Cliente #{idx + 1}</label>
              <input
                type="text"
                value={ts.name}
                onChange={(e) => updateTestimonial(idx, 'name', e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900"
              />
              <textarea
                rows={3}
                value={ts.text}
                onChange={(e) => updateTestimonial(idx, 'text', e.target.value)}
                placeholder="Comentario del cliente..."
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] text-slate-700"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
