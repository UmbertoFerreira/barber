import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, brl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Services() {
  const [services, setServices] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get("/services").then((res) => setServices(res.data)).catch(() => {});
  }, []);

  return (
    <section id="servicos" data-testid="services-section" className="relative py-24 lg:py-36 px-5 lg:px-8 bg-petrol-950 grain">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div>
            <p className="font-mono-label text-crimson-bright mb-4">— O que a gente faz</p>
            <h2 className="font-display font-bold uppercase text-3xl sm:text-4xl lg:text-5xl text-cream leading-tight" data-testid="services-title">
              Serviços &<br />
              <span className="text-gold-gradient">Tabela de Preços</span>
            </h2>
          </div>
          <p className="font-serif-alt italic text-cream/60 text-lg max-w-sm leading-relaxed">
            Todo atendimento com toalha quente e aquele capricho.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gold/15 border border-gold/15">
          {services.map((s, idx) => (
            <motion.article
              key={s.id}
              data-testid={`service-card-${idx}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ backgroundColor: "#152E34" }}
              className="group relative bg-petrol-900 p-8 lg:p-10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <span className="font-mono text-gold/40 text-sm">/{String(idx + 1).padStart(2, "0")}</span>
                <span className="flex items-center gap-1.5 font-mono-label text-cream/40">
                  <Clock size={12} /> {s.duration}
                </span>
              </div>
              <h3 className="font-serif-alt font-semibold text-2xl lg:text-3xl text-cream mb-3 leading-snug">{s.name}</h3>
              <p className="text-cream/55 text-sm leading-relaxed mb-8 max-w-md">{s.description}</p>
              <div className="flex items-center justify-between gap-4">
                <span data-testid={`service-price-${idx}`} className="font-display text-gold text-2xl lg:text-3xl">{brl(s.price)}</span>
                <button
                  data-testid={`service-book-button-${idx}`}
                  onClick={() => navigate(user ? "/cliente" : "/entrar")}
                  className="flex items-center gap-2 px-5 py-3 border border-gold/40 text-gold font-mono-label opacity-80 group-hover:opacity-100 group-hover:bg-gold group-hover:text-petrol-950 transition-all duration-300"
                >
                  <CalendarCheck size={14} /> Agendar
                </button>
              </div>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
