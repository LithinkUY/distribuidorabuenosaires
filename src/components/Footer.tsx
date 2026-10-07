import React from 'react';
import { Car, ShieldCheck } from 'lucide-react';
import { useStore, DEFAULT_FOOTER_SETTINGS } from '../context/StoreContext';

interface FooterProps {
  onOpenFitter: () => void;
  onOpenWholesale: () => void;
  scrollToSection: (id: string) => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenFitter,
  onOpenWholesale,
  scrollToSection,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { storeSettings, currentUser } = useStore();
  const footer = storeSettings?.footerSettings || DEFAULT_FOOTER_SETTINGS;

  const bgColor = storeSettings?.footerBgColor || '#0a0f1d';
  const textColor = storeSettings?.footerTextColor || '#94a3b8';

  // Helper to determine whether background is dark for heading contrast
  const isDarkBg = (() => {
    try {
      const hex = bgColor.replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 140;
      }
    } catch {}
    return true;
  })();

  const headingColor = isDarkBg ? '#ffffff' : '#0f172a';
  const borderColor = isDarkBg ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const cardBgColor = isDarkBg ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';

  const handleLinkClick = (link: { actionType: string; target: string }) => {
    if (link.actionType === 'fitter') {
      onOpenFitter();
    } else if (link.actionType === 'wholesale') {
      onOpenWholesale();
    } else if (link.actionType === 'section') {
      scrollToSection(link.target);
    } else if (link.actionType === 'url' && link.target) {
      if (link.target.startsWith('http')) {
        window.open(link.target, '_blank', 'noopener,noreferrer');
      } else {
        scrollToSection(link.target.replace('#', ''));
      }
    }
  };

  const links = footer.links && footer.links.length > 0 ? footer.links : DEFAULT_FOOTER_SETTINGS.links;

  return (
    <footer
      style={{ backgroundColor: bgColor, color: textColor, borderTopColor: borderColor }}
      className="border-t py-12 text-xs transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Columna 1: Brand & About */}
        <div className="space-y-3 md:col-span-1">
          <div
            style={{ color: headingColor }}
            className="flex items-center gap-2 font-display font-extrabold text-base tracking-wider uppercase"
          >
            {storeSettings?.logoUrl ? (
              <img
                src={storeSettings.logoUrl}
                alt={storeSettings.businessName}
                style={{ height: `${Math.min(storeSettings.logoSize || 40, 44)}px` }}
                className="w-auto object-contain"
              />
            ) : (
              <div
                style={{ backgroundColor: cardBgColor, borderColor }}
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-blue-500"
              >
                <Car className="w-4 h-4" />
              </div>
            )}
            <span>{storeSettings?.businessName || 'Distribuidora BA'}</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">
            {footer.aboutText || DEFAULT_FOOTER_SETTINGS.aboutText}
          </p>
        </div>

        {/* Columna 2: Colección & Servicios */}
        <div className="space-y-2">
          <strong
            style={{ color: headingColor }}
            className="text-xs uppercase tracking-wider block font-semibold"
          >
            {footer.column2Title || DEFAULT_FOOTER_SETTINGS.column2Title}
          </strong>
          <ul className="space-y-1.5 opacity-90">
            {links.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => handleLinkClick(link)}
                  className="hover:text-blue-500 transition-colors text-left"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3: Tu Cuenta */}
        <div className="space-y-2">
          <strong
            style={{ color: headingColor }}
            className="text-xs uppercase tracking-wider block font-semibold"
          >
            {footer.column3Title || DEFAULT_FOOTER_SETTINGS.column3Title}
          </strong>
          <ul className="space-y-1.5 opacity-90">
            {currentUser ? (
              <>
                <li>
                  <button
                    type="button"
                    onClick={onOpenProfile}
                    className="hover:text-blue-500 transition-colors text-left"
                  >
                    Mi Perfil ({currentUser.name.split(' ')[0]})
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenProfile}
                    className="hover:text-blue-500 transition-colors text-left"
                  >
                    Mis Vehículos Guardados
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenProfile}
                    className="hover:text-blue-500 transition-colors text-left"
                  >
                    Seguimiento de Pedidos
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="hover:text-blue-500 transition-colors text-left"
                  >
                    Iniciar Sesión
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="hover:text-blue-500 transition-colors text-left"
                  >
                    Crear Cuenta de Cliente
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Columna 4: Showroom Central */}
        <div className="space-y-2">
          <strong
            style={{ color: headingColor }}
            className="text-xs uppercase tracking-wider block font-semibold"
          >
            {footer.column4Title || DEFAULT_FOOTER_SETTINGS.column4Title}
          </strong>
          <div className="text-[11px] space-y-1 opacity-90">
            <p>{footer.showroomAddress || DEFAULT_FOOTER_SETTINGS.showroomAddress}</p>
            <p>{footer.showroomPhone || DEFAULT_FOOTER_SETTINGS.showroomPhone}</p>
            <p>{footer.showroomHours || DEFAULT_FOOTER_SETTINGS.showroomHours}</p>
            {footer.badgeText && (
              <div className="pt-1 flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{footer.badgeText}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{ borderTopColor: borderColor }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] opacity-80"
      >
        <div>
          © {new Date().getFullYear()} {storeSettings?.businessName || 'Distribuidora BA'}.{' '}
          {footer.copyrightText || DEFAULT_FOOTER_SETTINGS.copyrightText}
        </div>
        <div className="flex items-center gap-3">
          <span>{footer.subText || DEFAULT_FOOTER_SETTINGS.subText}</span>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenAuth}
            className="hover:text-blue-500 transition-colors font-semibold"
          >
            Panel Admin
          </button>
        </div>
      </div>
    </footer>
  );
};
