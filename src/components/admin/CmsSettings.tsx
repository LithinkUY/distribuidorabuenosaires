import React, { useState, useEffect } from 'react';
import { useStore, DEFAULT_CONTACT_SECTION, DEFAULT_FOOTER_SETTINGS } from '../../context/StoreContext';
import {
  Save,
  Layout,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Link,
  CheckCircle,
  Sparkles,
  Layers,
  Upload,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Car,
  ShieldCheck,
  PanelBottom,
} from 'lucide-react';
import { HomeSection, HeroSlide, MenuItem, ContactSectionSettings, FooterSettings, FooterLink } from '../../types';
import { saveMediaBlob, resolveMediaUrl } from '../../utils/mediaStorage';

const SlideMediaPreview: React.FC<{ slide: HeroSlide }> = ({ slide }) => {
  const [resolvedUrl, setResolvedUrl] = useState<string>(slide.mediaUrl);

  useEffect(() => {
    let isCurrent = true;
    resolveMediaUrl(slide.mediaUrl).then((url) => {
      if (isCurrent) setResolvedUrl(url || slide.mediaUrl);
    });
    return () => {
      isCurrent = false;
    };
  }, [slide.mediaUrl]);

  if (!slide.mediaUrl) return null;

  return (
    <div className="mt-2 flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
      {slide.type === 'video' ? (
        <video
          key={resolvedUrl}
          src={resolvedUrl}
          autoPlay
          muted
          loop
          playsInline
          className="w-36 h-20 object-cover rounded-lg border border-slate-300"
        />
      ) : (
        <img
          key={resolvedUrl}
          src={resolvedUrl}
          alt="Preview"
          className="w-36 h-20 object-cover rounded-lg border border-slate-300"
        />
      )}
      <div className="text-xs">
        <span className="font-bold text-slate-800 block">
          {slide.type === 'video' ? '🎬 Video cargado correctamente' : '🖼️ Imagen cargada'}
        </span>
        <span className="text-[10px] text-emerald-600 font-semibold block">
          {slide.mediaUrl.startsWith('idb:') ? 'Almacenado localmente en base de datos del navegador' : 'URL de imagen/video'}
        </span>
      </div>
    </div>
  );
};


export const CmsSettings: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useStore();
  const [settings, setSettings] = useState(storeSettings);
  const [isSaved, setIsSaved] = useState(false);

  const contact = settings.contactSection || DEFAULT_CONTACT_SECTION;
  const footer = settings.footerSettings || DEFAULT_FOOTER_SETTINGS;

  const updateFooterField = (field: keyof FooterSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      footerSettings: {
        ...(prev.footerSettings || DEFAULT_FOOTER_SETTINGS),
        [field]: value,
      },
    }));
  };

  const addFooterLink = () => {
    const currentLinks = footer.links && footer.links.length > 0 ? footer.links : DEFAULT_FOOTER_SETTINGS.links;
    updateFooterField('links', [
      ...currentLinks,
      { id: 'fl-' + Date.now(), label: 'Nuevo Enlace', actionType: 'section', target: 'productos' },
    ]);
  };

  const updateFooterLink = (id: string, field: keyof FooterLink, value: any) => {
    const currentLinks = (footer.links && footer.links.length > 0 ? footer.links : DEFAULT_FOOTER_SETTINGS.links).map((l) =>
      l.id === id ? { ...l, [field]: value } : l
    );
    updateFooterField('links', currentLinks);
  };

  const removeFooterLink = (id: string) => {
    const currentLinks = (footer.links && footer.links.length > 0 ? footer.links : DEFAULT_FOOTER_SETTINGS.links).filter((l) => l.id !== id);
    updateFooterField('links', currentLinks);
  };

  const updateContactField = (field: keyof ContactSectionSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      contactSection: {
        ...(prev.contactSection || DEFAULT_CONTACT_SECTION),
        [field]: value,
      },
    }));
  };

  const addContactFeature = () => {
    const currentFeatures = contact.features && contact.features.length > 0 ? contact.features : DEFAULT_CONTACT_SECTION.features;
    updateContactField('features', [...currentFeatures, 'Nuevo beneficio del servicio']);
  };

  const updateContactFeature = (index: number, val: string) => {
    const currentFeatures = [...(contact.features && contact.features.length > 0 ? contact.features : DEFAULT_CONTACT_SECTION.features)];
    currentFeatures[index] = val;
    updateContactField('features', currentFeatures);
  };

  const removeContactFeature = (index: number) => {
    const currentFeatures = (contact.features && contact.features.length > 0 ? contact.features : DEFAULT_CONTACT_SECTION.features).filter((_, i) => i !== index);
    updateContactField('features', currentFeatures);
  };

  // Default home sections if none exist
  const defaultSections: HomeSection[] = [
    { id: 'productos', title: 'Colección & Catálogo Principal', subtitle: 'Fundas listas para colocar con stock permanente garantizado', visible: true },
    { id: 'alfombras', title: 'Bandejas Termoformadas 3D & 5D', subtitle: 'Impermeabilidad total y protección contra barro y líquidos', visible: true },
    { id: 'resenas', title: 'Opiniones Reales de Clientes', subtitle: 'Más de 1.500 vehículos equipados en todo el país', visible: true },
    { id: 'contacto', title: 'Datos de contacto de la tienda', subtitle: 'Atención personalizada y asesoramiento en el acto', visible: true },
  ];

  const currentSections = settings.homeSections && settings.homeSections.length > 0 ? settings.homeSections : defaultSections;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Move section UP
  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...currentSections];
    const temp = newSections[index - 1];
    newSections[index - 1] = newSections[index];
    newSections[index] = temp;
    setSettings({ ...settings, homeSections: newSections });
  };

  // Move section DOWN
  const moveSectionDown = (index: number) => {
    if (index === currentSections.length - 1) return;
    const newSections = [...currentSections];
    const temp = newSections[index + 1];
    newSections[index + 1] = newSections[index];
    newSections[index] = temp;
    setSettings({ ...settings, homeSections: newSections });
  };

  // Update section text
  const updateSectionField = (index: number, field: 'title' | 'subtitle' | 'visible', value: any) => {
    const newSections = [...currentSections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSettings({ ...settings, homeSections: newSections });
  };

  // Slides handlers
  const addSlide = () => {
    setSettings({
      ...settings,
      heroSlides: [
        ...(settings.heroSlides || []),
        {
          id: 'slide-' + Date.now(),
          type: 'image',
          mediaUrl: '',
          title: 'Nuevo Título Principal',
          subtitle: 'Descripción destacada de la portada',
          buttonText: 'Ver Catálogo',
        },
      ],
    });
  };

  const updateSlide = (id: string, fieldOrUpdates: string | Partial<HeroSlide>, value?: any) => {
    setSettings((prev) => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).map((s) => {
        if (s.id !== id) return s;
        if (typeof fieldOrUpdates === 'string') {
          return { ...s, [fieldOrUpdates]: value };
        }
        return { ...s, ...fieldOrUpdates };
      }),
    }));
  };

  const removeSlide = (id: string) => {
    setSettings({
      ...settings,
      heroSlides: (settings.heroSlides || []).filter((s) => s.id !== id),
    });
  };

  // Menus handlers
  const addMenu = () => {
    setSettings({
      ...settings,
      menuItems: [
        ...(settings.menuItems || []),
        { id: 'menu-' + Date.now(), label: 'Nuevo Enlace', link: '#' },
      ],
    });
  };

  const updateMenu = (id: string, field: string, value: string) => {
    setSettings({
      ...settings,
      menuItems: (settings.menuItems || []).map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    });
  };

  const removeMenu = (id: string) => {
    setSettings({
      ...settings,
      menuItems: (settings.menuItems || []).filter((m) => m.id !== id),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Layout className="text-blue-600 w-7 h-7" />
            CMS & Gestor de Contenido del Home
          </h2>
          <p className="text-slate-600 text-sm mt-0.5">
            Organiza toda la portada web: reordena las secciones de lugar, cambia los textos, activa/oculta bloques y configura el Hero principal.
          </p>
        </div>
        {isSaved && (
          <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md">
            <CheckCircle className="w-4 h-4" /> ¡Cambios del Home guardados!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        
        {/* SECCIONES DEL HOME (REORDENAR, EDITAR Y ACTIVAR/DESACTIVAR) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div>
              <h3 className="text-slate-900 font-bold text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" /> Secciones del Home (Mover de lugar y Editar Textos)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Utiliza las flechas <b>Subir (↑)</b> y <b>Bajar (↓)</b> para cambiar el orden en que aparecen las secciones en la tienda.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {currentSections.map((section, index) => (
              <div
                key={section.id}
                className={`p-4 rounded-2xl border transition-all ${
                  section.visible ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-white border border-slate-300 text-slate-700 px-2.5 py-1 rounded-lg">
                      Posición #{index + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                      {section.id}
                    </span>
                    {!section.visible && (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Oculta
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveSectionUp(index)}
                      className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      title="Mover arriba"
                    >
                      <ArrowUp className="w-4 h-4" /> Subir
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === currentSections.length - 1}
                      onClick={() => moveSectionDown(index)}
                      className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      title="Mover abajo"
                    >
                      <ArrowDown className="w-4 h-4" /> Bajar
                    </button>

                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={() => updateSectionField(index, 'visible', !section.visible)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 ${
                        section.visible
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {section.visible ? (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Oculta
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Título de la Sección</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSectionField(index, 'title', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subtítulo Descriptivo</label>
                    <input
                      type="text"
                      value={section.subtitle || ''}
                      onChange={(e) => updateSectionField(index, 'subtitle', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {section.id === 'contacto' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Personaliza direcciones, horarios, WhatsApp y la tarjeta del taller:
                    </span>
                    <a
                      href="#editor-contacto"
                      className="text-xs bg-blue-100/70 hover:bg-blue-100 text-blue-800 font-bold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600" /> Ir a Personalizar Contacto & Taller ↓
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PERSONALIZACIÓN DE CONTACTO, SHOWROOM Y TALLER */}
        <div id="editor-contacto" className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5" /> Sección del Home
              </div>
              <h3 className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
                Personalizar "Contacto, Showroom & Taller"
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Modifica los textos, dirección de la sede, horarios, teléfonos, WhatsApp y beneficios de la tarjeta de taller.
              </p>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
            >
              <Save className="w-3.5 h-3.5" /> Guardar Cambios
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda: Información de Contacto & Showroom */}
            <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 text-blue-700 border-b border-slate-200 pb-2">
                <MapPin className="w-4 h-4" /> Columna Izquierda: Showroom y Atención
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Etiqueta Superior (Badge)</label>
                <input
                  type="text"
                  value={contact.badge}
                  onChange={(e) => updateContactField('badge', e.target.value)}
                  placeholder="Showroom & Taller de Colocación"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Título Principal</label>
                <input
                  type="text"
                  value={contact.title}
                  onChange={(e) => updateContactField('title', e.target.value)}
                  placeholder="Contactate con Nuestro Equipo"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Descripción / Bajada</label>
                <textarea
                  rows={2}
                  value={contact.description}
                  onChange={(e) => updateContactField('description', e.target.value)}
                  placeholder="Atención personalizada para la elección del material..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Caja 1: Sede */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5 text-blue-600">
                  <MapPin className="w-3.5 h-3.5" /> Caja de Ubicación / Sede
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Título de la Sede</label>
                  <input
                    type="text"
                    value={contact.locationTitle}
                    onChange={(e) => updateContactField('locationTitle', e.target.value)}
                    placeholder="Sede Central Montevideo"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Dirección Completa</label>
                  <input
                    type="text"
                    value={contact.locationAddress}
                    onChange={(e) => updateContactField('locationAddress', e.target.value)}
                    placeholder="Av. Italia 3840 esq. Comercio, Montevideo, Uruguay"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Caja 2: Horarios */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5 text-blue-600">
                  <Clock className="w-3.5 h-3.5" /> Caja de Horarios
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Título del Horario</label>
                  <input
                    type="text"
                    value={contact.hoursTitle}
                    onChange={(e) => updateContactField('hoursTitle', e.target.value)}
                    placeholder="Horarios de Atención y Colocación"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Días y Horas</label>
                  <input
                    type="text"
                    value={contact.hoursText}
                    onChange={(e) => updateContactField('hoursText', e.target.value)}
                    placeholder="Lunes a Viernes: 08:30 a 18:30 hs · Sábados: 09:00 a 13:00 hs"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Caja 3: Teléfonos */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5 text-blue-600">
                  <Phone className="w-3.5 h-3.5" /> Caja de Líneas Telefónicas
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Título</label>
                  <input
                    type="text"
                    value={contact.phonesTitle}
                    onChange={(e) => updateContactField('phonesTitle', e.target.value)}
                    placeholder="Líneas de Atención Telefónica"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Teléfonos y Canales</label>
                  <input
                    type="text"
                    value={contact.phonesText}
                    onChange={(e) => updateContactField('phonesText', e.target.value)}
                    placeholder="UY: +598 2508 1234 · WhatsApp Ventas: +598 99 123 456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Botón WhatsApp */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5 text-emerald-600">
                  <MessageSquare className="w-3.5 h-3.5" /> Botón de WhatsApp
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Texto del Botón</label>
                  <input
                    type="text"
                    value={contact.whatsappButtonText}
                    onChange={(e) => updateContactField('whatsappButtonText', e.target.value)}
                    placeholder="Hablar con un Asesor de Taller por WhatsApp"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Número de WhatsApp (con código de país sin signos, ej: 59899123456)</label>
                  <input
                    type="text"
                    value={contact.whatsappNumber}
                    onChange={(e) => updateContactField('whatsappNumber', e.target.value)}
                    placeholder="59899123456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Mensaje predeterminado al abrir WhatsApp</label>
                  <textarea
                    rows={2}
                    value={contact.whatsappMessage}
                    onChange={(e) => updateContactField('whatsappMessage', e.target.value)}
                    placeholder="¡Hola! Quisiera coordinar una visita..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta de Colocación & Beneficios */}
            <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 text-blue-700 border-b border-slate-200 pb-2">
                <Car className="w-4 h-4" /> Columna Derecha: Tarjeta de Taller & Beneficios
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Título de la Tarjeta / Ubicación</label>
                <input
                  type="text"
                  value={contact.cardTitle}
                  onChange={(e) => updateContactField('cardTitle', e.target.value)}
                  placeholder="Ubicación de Taller & Showroom"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Google Maps Embed Iframe URL */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5 text-blue-600">
                  <MapPin className="w-3.5 h-3.5" /> Mapa Interactivo de Google Maps (Responsive)
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                    URL Embed o Código iframe de Google Maps
                  </label>
                  <textarea
                    rows={2}
                    value={contact.mapIframeUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Extract src if user pasted a full <iframe ...>
                      const match = val.match(/src=["'](.*?)["']/);
                      updateContactField('mapIframeUrl', match ? match[1] : val);
                    }}
                    placeholder='Pega aquí el enlace https://www.google.com/maps/embed?... o la etiqueta <iframe ...>'
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-800 focus:border-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Se ajusta automáticamente al 100% de ancho en móviles y computadoras.
                  </span>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                    Enlace de "Cómo llegar" (Google Maps)
                  </label>
                  <input
                    type="text"
                    value={contact.mapGoogleLink || ''}
                    onChange={(e) => updateContactField('mapGoogleLink', e.target.value)}
                    placeholder="https://maps.google.com/?q=Franklin+D.+Roosevelt+1700..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Beneficios / Viñetas */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Beneficios Destacados (Viñetas Verdes)
                  </span>
                  <button
                    type="button"
                    onClick={addContactFeature}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Beneficio
                  </button>
                </div>

                <div className="space-y-2">
                  {(contact.features && contact.features.length > 0 ? contact.features : DEFAULT_CONTACT_SECTION.features).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => updateContactFeature(idx, e.target.value)}
                        placeholder="Descripción del beneficio..."
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                      />
                      {(contact.features || DEFAULT_CONTACT_SECTION.features).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContactFeature(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar beneficio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloque Garantía */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5 text-blue-600">
                  <ShieldCheck className="w-3.5 h-3.5" /> Bloque de Garantía
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Etiqueta Superior</label>
                    <input
                      type="text"
                      value={contact.guaranteeLabel}
                      onChange={(e) => updateContactField('guaranteeLabel', e.target.value)}
                      placeholder="Garantía Escrita"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Texto Destacado</label>
                    <input
                      type="text"
                      value={contact.guaranteeText}
                      onChange={(e) => updateContactField('guaranteeText', e.target.value)}
                      placeholder="3 Años de Cobertura Total"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HERO SLIDER DE PORTADA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div>
              <h3 className="text-slate-900 font-bold text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" /> Carrusel de Portada (Hero Slider)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configura los banners principales que pasan en pantalla al inicio de la página.
              </p>
            </div>
            <button
              type="button"
              onClick={addSlide}
              className="text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Slide
            </button>
          </div>

          <div className="space-y-4">
            {(settings.heroSlides || []).map((slide, i) => (
              <div key={slide.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => removeSlide(slide.id)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar slide"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="font-bold text-slate-700 text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                  Slide #{i + 1}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Título Grande (Hero)</label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subtítulo</label>
                    <input
                      type="text"
                      value={slide.subtitle}
                      onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipo de Fondo</label>
                    <select
                      value={slide.type}
                      onChange={(e) => updateSlide(slide.id, 'type', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                    >
                      <option value="image">Imagen de Fondo</option>
                      <option value="video">Video (URL MP4)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Texto del Botón</label>
                    <input
                      type="text"
                      value={slide.buttonText}
                      onChange={(e) => updateSlide(slide.id, 'buttonText', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fondo (URL o Subir Archivo)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://... o sube un video/imagen desde tu PC"
                        value={slide.mediaUrl}
                        onChange={(e) => updateSlide(slide.id, 'mediaUrl', e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                      />
                      <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0">
                        <Upload className="w-3.5 h-3.5" /> Subir Archivo
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            if (file.type.startsWith('video/')) {
                              try {
                                const mediaKey = `hero_slide_video_${slide.id}_${Date.now()}`;
                                const ref = await saveMediaBlob(mediaKey, file);
                                updateSlide(slide.id, {
                                  mediaUrl: ref,
                                  type: 'video',
                                });
                              } catch (err) {
                                console.error('Error saving video:', err);
                                alert('Error al procesar el archivo de video en el navegador.');
                              }
                            } else {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  let width = img.width;
                                  let height = img.height;
                                  const MAX = 1920;
                                  if (width > height) {
                                    if (width > MAX) {
                                      height *= MAX / width;
                                      width = MAX;
                                    }
                                  } else {
                                    if (height > MAX) {
                                      width *= MAX / height;
                                      height = MAX;
                                    }
                                  }
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  ctx?.drawImage(img, 0, 0, width, height);
                                  const compressed = canvas.toDataURL('image/jpeg', 0.8);
                                  updateSlide(slide.id, {
                                    mediaUrl: compressed,
                                    type: 'image',
                                  });
                                };
                                img.src = ev.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Media Preview Box */}
                    <SlideMediaPreview slide={slide} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MENUS DE NAVEGACIÓN */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div>
              <h3 className="text-slate-900 font-bold text-base flex items-center gap-2">
                <Link className="w-5 h-5 text-blue-600" /> Menús de Navegación del Header
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Administra los enlaces que se muestran en el menú superior.</p>
            </div>
            <button
              type="button"
              onClick={addMenu}
              className="text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Menú
            </button>
          </div>

          <div className="space-y-2.5">
            {(settings.menuItems || []).map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs font-mono font-bold w-6">{i + 1}.</span>
                <input
                  type="text"
                  placeholder="Texto del menú (ej: Productos)"
                  value={m.label}
                  onChange={(e) => updateMenu(m.id, 'label', e.target.value)}
                  className="w-1/3 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Enlace o ID (ej: productos)"
                  value={m.link}
                  onChange={(e) => updateMenu(m.id, 'link', e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => removeMenu(m.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar menú"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* GESTIÓN Y CONTENIDO DEL FOOTER (PIE DE PÁGINA) */}
        <div id="editor-footer" className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                <PanelBottom className="w-3.5 h-3.5 text-blue-600" /> Pie de Página
              </div>
              <h3 className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
                Gestionar y Personalizar el Footer
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Administra los textos, columnas de enlaces, datos de contacto del pie y colores.
              </p>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
            >
              <Save className="w-3.5 h-3.5" /> Guardar Cambios
            </button>
          </div>

          {/* Selector Rápido de Colores del Footer */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Colores del Footer</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Color de Fondo del Footer</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.footerBgColor || '#0a0f1d'}
                    onChange={(e) => setSettings({ ...settings, footerBgColor: e.target.value })}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={settings.footerBgColor || '#0a0f1d'}
                    onChange={(e) => setSettings({ ...settings, footerBgColor: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Color del Texto del Footer</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.footerTextColor || '#94a3b8'}
                    onChange={(e) => setSettings({ ...settings, footerTextColor: e.target.value })}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={settings.footerTextColor || '#94a3b8'}
                    onChange={(e) => setSettings({ ...settings, footerTextColor: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna 1: Descripción de la Empresa */}
            <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-2">
                Columna 1: Empresa & Resumen
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Texto Descriptivo (Bajo el Logo)</label>
                <textarea
                  rows={3}
                  value={footer.aboutText}
                  onChange={(e) => updateFooterField('aboutText', e.target.value)}
                  placeholder="Especialistas en tapizados y cubreasientos..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Columna 3: Tu Cuenta */}
            <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-2">
                Columna 3: Título de Sección Cuenta
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Título de la Columna</label>
                <input
                  type="text"
                  value={footer.column3Title}
                  onChange={(e) => updateFooterField('column3Title', e.target.value)}
                  placeholder="Tu Cuenta"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">Los enlaces de perfil e inicio de sesión se actualizan según la sesión del usuario.</p>
              </div>
            </div>

            {/* Columna 2: Enlaces Personalizables */}
            <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-700">
                  Columna 2: Enlaces y Servicios del Footer
                </h4>
                <button
                  type="button"
                  onClick={addFooterLink}
                  className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Enlace
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Título de la Columna</label>
                <input
                  type="text"
                  value={footer.column2Title}
                  onChange={(e) => updateFooterField('column2Title', e.target.value)}
                  placeholder="Colección & Servicios"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                {(footer.links || []).map((link) => (
                  <div key={link.id} className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      placeholder="Texto del enlace"
                      value={link.label}
                      onChange={(e) => updateFooterLink(link.id, 'label', e.target.value)}
                      className="w-full sm:w-1/3 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                    />

                    <select
                      value={link.actionType}
                      onChange={(e) => updateFooterLink(link.id, 'actionType', e.target.value as any)}
                      className="w-full sm:w-1/4 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                    >
                      <option value="section">Ir a Sección (#)</option>
                      <option value="fitter">Abrir Probador 3D</option>
                      <option value="wholesale">Abrir Mayorista</option>
                      <option value="url">Enlace URL Externo</option>
                    </select>

                    {link.actionType === 'section' ? (
                      <select
                        value={link.target}
                        onChange={(e) => updateFooterLink(link.id, 'target', e.target.value)}
                        className="w-full sm:flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                      >
                        <option value="productos">Sección Productos</option>
                        <option value="alfombras">Sección Alfombras</option>
                        <option value="resenas">Sección Reseñas</option>
                        <option value="contacto">Sección Contacto</option>
                      </select>
                    ) : link.actionType === 'url' ? (
                      <input
                        type="text"
                        placeholder="https://..."
                        value={link.target}
                        onChange={(e) => updateFooterLink(link.id, 'target', e.target.value)}
                        className="w-full sm:flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                      />
                    ) : (
                      <div className="w-full sm:flex-1 text-slate-400 text-xs italic px-2">Acción interna directa</div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFooterLink(link.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar enlace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna 4: Showroom en Footer */}
            <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200 lg:col-span-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-2">
                Columna 4: Datos del Showroom en Footer
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Título de la Columna</label>
                  <input
                    type="text"
                    value={footer.column4Title}
                    onChange={(e) => updateFooterField('column4Title', e.target.value)}
                    placeholder="Showroom Central"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Dirección de Showroom</label>
                  <input
                    type="text"
                    value={footer.showroomAddress}
                    onChange={(e) => updateFooterField('showroomAddress', e.target.value)}
                    placeholder="Av. Italia 3840, Montevideo, Uruguay"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">WhatsApp / Teléfono</label>
                  <input
                    type="text"
                    value={footer.showroomPhone}
                    onChange={(e) => updateFooterField('showroomPhone', e.target.value)}
                    placeholder="WhatsApp: +598 99 123 456"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Horario de Atención</label>
                  <input
                    type="text"
                    value={footer.showroomHours}
                    onChange={(e) => updateFooterField('showroomHours', e.target.value)}
                    placeholder="Horario: Lun a Vie 08:30 a 18:30 hs"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Insignia / Badge de Garantía (Verde)</label>
                  <input
                    type="text"
                    value={footer.badgeText}
                    onChange={(e) => updateFooterField('badgeText', e.target.value)}
                    placeholder="Colocación Gratuita en Taller"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Barra Inferior / Copyright & Lemas */}
            <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200 lg:col-span-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-2">
                Barra Inferior: Copyright y Lemas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Texto de Copyright</label>
                  <input
                    type="text"
                    value={footer.copyrightText}
                    onChange={(e) => updateFooterField('copyrightText', e.target.value)}
                    placeholder="Todos los derechos reservados."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Lemas / Países</label>
                  <input
                    type="text"
                    value={footer.subText}
                    onChange={(e) => updateFooterField('subText', e.target.value)}
                    placeholder="Uruguay · Argentina · Garantía de Calce 100%"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTON GUARDAR */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20 text-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" /> Guardar Cambios de CMS & Home
          </button>
        </div>
      </form>
    </div>
  );
};
