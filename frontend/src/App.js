import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/AuthPage";
import ClientArea from "@/pages/ClientArea";
import AdminArea from "@/pages/AdminArea";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) window.__lenis ? window.__lenis.scrollTo(el, { offset: -80 }) : el.scrollIntoView();
      }, 200);
    } else {
      window.__lenis ? window.__lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <div className="App">
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollManager />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/entrar" element={<AuthPage />} />
              <Route path="/cliente" element={<ClientArea />} />
              <Route path="/admin" element={<AdminArea />} />
            </Routes>
          </BrowserRouter>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0F2327",
                border: "1px solid rgba(212,175,55,0.35)",
                color: "#F4F1EA",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
