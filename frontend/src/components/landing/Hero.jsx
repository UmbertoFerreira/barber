import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Scissors } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LogoEmblem } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";

const HERO_BG = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwYmFyYmVyc2hvcCUyMGhhaXIlMjBzdHlsaW5nJTIwYmFyYmVyJTIwdG9vbHMlMjBoYWlyY3V0JTIwZ2VudGxlbWFufGVufDB8fHx8MTc4NjgyNzY2MHww&ixlib=rb-4.1.0&q=85";

function MaskedLine({ children, delay, className }) {
  return (
    <span className="block overflow-hidden pb-1">
      <motion.span
        className={`block ${className || ""}`}
        initial={{ y: "115%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "55%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} data-testid="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden grain">
      <motion.div style={{ y: bgY }} className="absolute inset-0 -top-[15%] h-[130%]">
        <img src={HERO_BG} alt="Barbearia vintage Antonio Barber" className="w-full h-full object-cover opacity-40" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-petrol-950/80 via-petrol-900/70 to-petrol-950" />
      <div className="absolute inset-0 spotlight" />

      {/* lateral barber poles */}
      <div className="hidden md:block absolute left-8 top-1/2 -translate-y-1/2 w-3 h-56 rounded-full barber-pole-stripes opacity-70 border border-gold/30" />
      <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 w-3 h-56 rounded-full barber-pole-stripes opacity-70 border border-gold/30" />

      <motion.div style={{ y: contentY, opacity: fade }} className="relative z-10 text-center px-5 pt-28 pb-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-8"
        >
          <LogoEmblem size={150} className="drop-shadow-[0_10px_35px_rgba(212,175,55,0.25)]" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, letterSpacing: "0.35em" }}
          transition={{ duration: 1.4, delay: 0.5 }}
          className="font-mono-label text-gold mb-6"
          data-testid="hero-eyebrow"
        >
          BARBEARIA · CORTE · BARBA · LOJA
        </motion.p>

        <h1 className="font-display font-bold uppercase leading-[1.05] text-4xl sm:text-5xl lg:text-6xl tracking-tight" data-testid="hero-headline">
          <MaskedLine delay={0.35}>Corte e barba</MaskedLine>
          <MaskedLine delay={0.5} className="text-gold-gradient">do seu jeito,</MaskedLine>
          <MaskedLine delay={0.65}>sem frescura</MaskedLine>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="font-serif-alt italic text-cream/75 text-lg md:text-xl mt-7 max-w-2xl mx-auto leading-relaxed"
          data-testid="hero-subtext"
        >
          Agende seu horário, escolha sua referência na galeria e aproveite a loja da casa.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <button
            data-testid="hero-booking-cta"
            onClick={() => navigate(user ? "/cliente" : "/entrar")}
            className="group flex items-center gap-3 px-8 py-4 bg-crimson text-cream font-mono-label font-semibold hover:bg-crimson-bright transition-colors duration-300"
          >
            <Scissors size={16} className="transition-transform duration-500 group-hover:rotate-[20deg]" />
            Agendar Horário
          </button>
          <button
            data-testid="hero-shop-cta"
            onClick={() => {
              const el = document.querySelector("#perfumes");
              if (el) window.__lenis ? window.__lenis.scrollTo(el, { offset: -80 }) : el.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 border border-gold/50 text-gold font-mono-label hover:bg-gold hover:text-petrol-950 transition-colors duration-300"
          >
            Visitar a Loja
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/40"
      >
        <span className="font-mono-label text-[0.6rem]">Role para explorar</span>
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-px h-8 bg-gradient-to-b from-gold to-transparent block" />
      </motion.div>
    </section>
  );
}
