import React from 'react';
import { MapPin, Phone, Clock, MessageSquare, ShieldCheck, Car, ExternalLink } from 'lucide-react';
import { useStore, DEFAULT_CONTACT_SECTION } from '../context/StoreContext';

export const ContactSection: React.FC = () => {
  const { storeSettings } = useStore();
  const contact = storeSettings?.contactSection || DEFAULT_CONTACT_SECTION;

  const openWhatsAppGeneral = () => {
    const rawNumber = (contact.whatsappNumber || '5491112345678').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(contact.whatsappMessage || '¡Hola! Quisiera realizar una consulta a Distribuidora Buenos Aires sobre sus productos y envíos.');
    window.open(`https://wa.me/${rawNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const featureList = contact.features && contact.features.length > 0 ? contact.features : DEFAULT_CONTACT_SECTION.features;
  const mapUrl = contact.mapIframeUrl || DEFAULT_CONTACT_SECTION.mapIframeUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.9992332500856!2d-58.45380459999999!3d-34.5535748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb42dd70c6349%3A0x3a03ff44b1ea6ef3!2sFranklin%20D.%20Roosevelt%201700%2C%20C1772%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires%2C%20Argentina!5e0!3m2!1ses!2suy!4v1791325820777!5m2!1ses!2suy";
  const googleMapsDirectionsUrl = contact.mapGoogleLink || DEFAULT_CONTACT_SECTION.mapGoogleLink || "https://maps.google.com/?q=Franklin+D.+Roosevelt+1700,+C1772+Buenos+Aires,+Argentina";

  return (
    <section id="contacto" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>Datos de contacto de la tienda</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
                {contact.title || DEFAULT_CONTACT_SECTION.title}
              </h2>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed">
              {contact.description || DEFAULT_CONTACT_SECTION.description}
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-100/60 border border-slate-200">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">
                    {contact.locationTitle || DEFAULT_CONTACT_SECTION.locationTitle}
                  </strong>
                  <span className="text-xs text-slate-600">
                    {contact.locationAddress || DEFAULT_CONTACT_SECTION.locationAddress}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-100/60 border border-slate-200">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">
                    {contact.hoursTitle || DEFAULT_CONTACT_SECTION.hoursTitle}
                  </strong>
                  <span className="text-xs text-slate-600">
                    {contact.hoursText || DEFAULT_CONTACT_SECTION.hoursText}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-100/60 border border-slate-200">
                <Phone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">
                    {contact.phonesTitle || DEFAULT_CONTACT_SECTION.phonesTitle}
                  </strong>
                  <span className="text-xs text-slate-600 font-mono">
                    {contact.phonesText || DEFAULT_CONTACT_SECTION.phonesText}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={openWhatsAppGeneral}
                className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-transform active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{contact.whatsappButtonText || DEFAULT_CONTACT_SECTION.whatsappButtonText}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Responsive Interactive Google Map */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/20 blur-3xl pointer-events-none" />

            {/* Header with Title and 'Cómo llegar' action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Ubicacion</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {contact.locationAddress || DEFAULT_CONTACT_SECTION.locationAddress}
                </p>
              </div>

              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 self-start sm:self-auto"
                title="Abrir ubicación en Google Maps"
              >
                <span>Cómo Llegar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Responsive Map Container with 100% fluid dimensions */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:h-[380px] min-h-[300px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
              <iframe
                src={mapUrl}
                className="w-full h-full border-0 absolute inset-0"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Ubicación en Google Maps"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
