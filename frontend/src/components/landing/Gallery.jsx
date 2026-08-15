import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Scissors, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CUTS = [
  {
    name: "Degradê Navalhado",
    desc: "Fade cirúrgico finalizado na lâmina",
    image: "https://images.unsplash.com/photo-1647140655214-e4a2d914971f?fm=jpg&q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Social Executivo",
    desc: "Tesoura clássica, risca lateral impecável",
    image: "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?fm=jpg&q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Tesoura Artesanal",
    desc: "Corte inteiro na tesoura, sem máquina",
    image: "https://images.unsplash.com/photo-1635273051937-a0ddef9573b6?fm=jpg&q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Buzz & Barba Alinhada",
    desc: "Máquina rente com contorno de navalha",
    image: "https://images.unsplash.com/photo-1657105052497-f996284ffff8?fm=jpg&q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Máquina de Precisão",
    desc: "Linhas limpas e acabamento milimétrico",
    image: "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?fm=jpg&q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Pompadour Vintage",
    desc: "Volume clássico com brilho de pomada",
    image: "https://images.unsplash.com/photo-1578390432942-d323db577792?fm=jpg&q=80&w=1200&auto=format&fit=crop",
  },
];

export default function Gallery() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const pickStyle = (cut) => {
    sessionStorage.setItem("referencia_corte", cut.name);
    navigate(user ? "/cliente" : "/entrar");
  };

  return (
    <section id="galeria" data-testid="gallery-section" className="relative py-24 lg:py-36 px-5 lg:px-8 bg-petrol-900 grain overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div>
            <p className="font-mono-label text-crimson-bright mb-4">— Capítulo II · A Vitrine</p>
            <h2 className="font-display font-bold uppercase text-3xl sm:text-4xl lg:text-5xl text-cream leading-tight" data-testid="gallery-title">
              Galeria de<br />
              <span className="text-gold-gradient">Cortes da Casa</span>
            </h2>
          </div>
          <p className="font-serif-alt italic text-cream/60 text-lg max-w-sm leading-relaxed">
            Escolha sua referência e chegue com o estilo pronto — a gente cuida do resto.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CUTS.map((cut, idx) => (
            <motion.figure
              key={cut.name}
              data-testid={`gallery-card-${idx}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: (idx % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative overflow-hidden gold-frame cursor-pointer ${idx % 3 === 1 ? "lg:translate-y-10" : ""}`}
              onClick={() => pickStyle(cut)}
            >
              <div className="aspect-[3/4] overflow-hidden">
                <motion.img
                  src={cut.image}
                  alt={`Corte ${cut.name}`}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-petrol-950/95 via-petrol-950/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="absolute top-4 left-4 font-mono text-gold/60 text-xs">/{String(idx + 1).padStart(2, "0")}</span>
              <figcaption className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="font-serif-alt font-semibold text-2xl text-cream">{cut.name}</h3>
                <p className="text-cream/55 text-sm font-serif-alt italic mt-1">{cut.desc}</p>
                <span
                  data-testid={`gallery-pick-${idx}`}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-crimson text-cream font-mono-label text-[0.6rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                >
                  <Scissors size={13} /> Quero esse estilo <ArrowRight size={13} />
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
