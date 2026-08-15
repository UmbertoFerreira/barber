import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, User, Menu, X, LogOut, Shield } from "lucide-react";
import { LogoIcon } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const LINKS = [
  { label: "Serviços & Preços", hash: "#servicos" },
  { label: "Galeria", hash: "#galeria" },
  { label: "Perfumes", hash: "#perfumes" },
  { label: "Vestuário", hash: "#vestuario" },
  { label: "Manifesto", hash: "#manifesto" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count, setOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goTo = (hash) => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate("/" + hash);
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) window.__lenis ? window.__lenis.scrollTo(el, { offset: -80 }) : el.scrollIntoView();
      }, 150);
      return;
    }
    const el = document.querySelector(hash);
    if (el) window.__lenis ? window.__lenis.scrollTo(el, { offset: -80 }) : el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header data-testid="main-header" className="fixed top-0 left-0 right-0 z-50 glass-header border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-3 group">
          <LogoIcon size={42} className="transition-transform duration-500 group-hover:rotate-[8deg]" />
          <div className="leading-none">
            <span className="font-display font-bold text-gold text-base tracking-wider block">ANTONIO</span>
            <span className="font-mono-label text-crimson-bright text-[0.6rem]">BARBER</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8" data-testid="nav-links">
          {LINKS.map((l) => (
            <button
              key={l.hash}
              data-testid={`nav-link-${l.hash.slice(1)}`}
              onClick={() => goTo(l.hash)}
              className="font-mono-label text-cream/70 hover:text-gold transition-colors duration-300"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            data-testid="cart-open-button"
            onClick={() => setOpen(true)}
            className="relative p-2.5 border border-gold/25 hover:border-gold/70 text-gold transition-colors duration-300"
            aria-label="Abrir sacola"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span data-testid="cart-count-badge" className="absolute -top-2 -right-2 bg-crimson text-cream text-[0.65rem] font-mono w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  data-testid="nav-admin-button"
                  className="flex items-center gap-2 px-4 py-2.5 border border-crimson/60 text-crimson-bright font-mono-label hover:bg-crimson hover:text-cream transition-colors duration-300"
                >
                  <Shield size={14} /> Painel Admin
                </Link>
              )}
              <Link
                to="/cliente"
                data-testid="nav-client-area-button"
                className="flex items-center gap-2 px-4 py-2.5 bg-gold text-petrol-950 font-mono-label font-medium hover:bg-gold-bright transition-colors duration-300"
              >
                <User size={14} /> Área do Cliente
              </Link>
              <button
                data-testid="nav-logout-button"
                onClick={async () => { await logout(); navigate("/"); }}
                className="p-2.5 text-cream/50 hover:text-crimson-bright transition-colors"
                aria-label="Sair"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <Link
              to="/entrar"
              data-testid="nav-login-button"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gold text-petrol-950 font-mono-label font-medium hover:bg-gold-bright transition-colors duration-300"
            >
              <User size={14} /> Entrar
            </Link>
          )}

          <button
            data-testid="mobile-menu-button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 text-gold border border-gold/25"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            data-testid="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden border-t border-gold/15 bg-petrol-900/95"
          >
            <div className="px-6 py-5 flex flex-col gap-4">
              {LINKS.map((l) => (
                <button
                  key={l.hash}
                  data-testid={`mobile-nav-link-${l.hash.slice(1)}`}
                  onClick={() => goTo(l.hash)}
                  className="text-left font-mono-label text-cream/80 hover:text-gold"
                >
                  {l.label}
                </button>
              ))}
              <div className="pt-3 border-t border-white/10 flex gap-3">
                {user ? (
                  <>
                    <Link to="/cliente" data-testid="mobile-client-button" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-3 bg-gold text-petrol-950 font-mono-label">
                      Área do Cliente
                    </Link>
                    {user.role === "admin" && (
                      <Link to="/admin" data-testid="mobile-admin-button" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-3 border border-crimson text-crimson-bright font-mono-label">
                        Admin
                      </Link>
                    )}
                  </>
                ) : (
                  <Link to="/entrar" data-testid="mobile-login-button" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-3 bg-gold text-petrol-950 font-mono-label">
                    Entrar / Cadastrar
                  </Link>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
