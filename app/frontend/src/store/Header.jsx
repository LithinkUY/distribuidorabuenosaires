import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, User, Menu, ChevronDown, ChevronRight, X } from "lucide-react";
import { useSite } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { img } from "@/lib/api";
import SearchBox from "@/store/SearchBox";

function NavItem({ item, depth = 0 }) {
  const kids = item.children || [];
  if (depth === 0) {
    return (
      <li className="relative group">
        <Link to={item.url || "#"} data-testid={`nav-${item.label}`} className="flex items-center gap-1 py-3 text-[13px] font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity">
          {item.label}{kids.length > 0 && <ChevronDown className="w-3.5 h-3.5" />}
        </Link>
        {kids.length > 0 && (
          <ul className="absolute left-0 top-full min-w-[220px] card-theme shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 text-ink">
            {kids.map((c) => <NavItem key={c.id} item={c} depth={1} />)}
          </ul>
        )}
      </li>
    );
  }
  return (
    <li className="relative group/sub">
      <Link to={item.url || "#"} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-brand2 transition-colors">
        {item.label}{kids.length > 0 && <ChevronRight className="w-3.5 h-3.5" />}
      </Link>
      {kids.length > 0 && (
        <ul className="absolute left-full top-0 min-w-[200px] card-theme shadow-xl py-2 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-opacity">
          {kids.map((c) => <NavItem key={c.id} item={c} depth={2} />)}
        </ul>
      )}
    </li>
  );
}

function MobileTree({ items, close, depth = 0 }) {
  return (
    <ul className={depth ? "pl-4 border-l border-line ml-2" : ""}>
      {items.map((i) => (
        <li key={i.id}>
          <Link to={i.url || "#"} onClick={close} className="block py-2.5 font-medium">{i.label}</Link>
          {i.children?.length > 0 && <MobileTree items={i.children} close={close} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

export const Logo = ({ settings, dark }) => {
  const id = settings.identity || {};
  const src = dark ? id.logo_dark || id.logo : id.logo;
  const h = settings.header?.logo_height || 40;
  return src ? <img src={img(src)} alt={id.brand_name} style={{ height: h }} className="w-auto object-contain" />
    : <span className="font-extrabold tracking-[0.2em] text-lg sm:text-xl whitespace-nowrap" style={{ lineHeight: `${h}px` }}>{id.brand_name || "TIENDA"}</span>;
};

export default function Header() {
  const { settings } = useSite();
  const { count, setOpen, currency, setCurrency } = useCart();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const h = settings.header || {};
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  const overlay = h.transparent && pathname === "/";
  const bg = overlay && !scrolled ? "transparent" : h.bg || "var(--bg-header)";
  const pos = overlay ? "fixed left-0 right-0" : h.sticky ? "sticky" : "relative";

  return (
    <>
      <header data-testid="store-header" className={`${pos} top-0 z-40 text-hdrtext transition-colors duration-300 ${scrolled ? "shadow-sm backdrop-blur-md" : ""}`} style={{ background: bg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 lg:gap-8 py-3">
          <button className="lg:hidden" onClick={() => setMobile(true)} data-testid="mobile-menu-btn"><Menu className="w-6 h-6" /></button>
          <Link to="/" data-testid="header-logo" className="shrink-0"><Logo settings={settings} /></Link>
          <div className="flex-1 hidden md:block"><SearchBox /></div>
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <div className="flex text-[11px] font-bold border border-current/20 overflow-hidden" style={{ borderRadius: "var(--radius)" }} data-testid="currency-switch">
              {["ARS", "USD"].map((c) => (
                <button key={c} data-testid={`currency-${c}`} onClick={() => setCurrency(c)}
                  className="px-2.5 py-1.5 transition-colors" style={currency === c ? { background: "var(--header-text)", color: "var(--bg-header)" } : {}}>{c}</button>
              ))}
            </div>
            <Link to={user ? (user.role === "ADMIN" ? "/admin" : "/cuenta") : "/login"} data-testid="header-account" className="hover:opacity-70"><User className="w-5 h-5" /></Link>
            <button onClick={() => setOpen(true)} data-testid="header-cart-btn" className="relative hover:opacity-70">
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && <span data-testid="cart-count" className="absolute -top-2 -right-2 bg-sale text-white text-[10px] font-bold w-4 h-4 rounded-full grid place-items-center">{count}</span>}
            </button>
          </div>
        </div>
        <div className="md:hidden px-4 pb-3"><SearchBox /></div>
        <nav className="hidden lg:block border-t border-current/10">
          <ul className="max-w-7xl mx-auto px-8 flex items-center justify-center gap-8">
            {(settings.menu || []).map((m) => <NavItem key={m.id} item={m} />)}
          </ul>
        </nav>
      </header>
      {mobile && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobile(false)}>
          <div className="bg-surface text-ink w-80 max-w-[85%] h-full p-6 overflow-y-auto fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6"><Logo settings={settings} /><button onClick={() => setMobile(false)}><X /></button></div>
            <MobileTree items={settings.menu || []} close={() => setMobile(false)} />
          </div>
        </div>
      )}
    </>
  );
}
