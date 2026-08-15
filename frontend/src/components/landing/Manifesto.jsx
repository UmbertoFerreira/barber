import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const CHAPTERS = [
  {
    number: "01",
    heading: "A Tradição da Lâmina",
    body: "Respeitamos a precisão do passado. Cada navalhada é executada com a calma e o domínio de um ofício repassado de geração em geração.",
  },
  {
    number: "02",
    heading: "O Santuário do Gentleman",
    body: "Nossa barbearia não é apenas um local de passagem, mas um refúgio para desacelerar, saborear um bom café ou uísque e renovar a confiança.",
  },
  {
    number: "03",
    heading: "Assinatura Inconfundível",
    body: "Seja no corte clássico, na barba alinhada ou nas fragrâncias exclusivas, garantimos que você carregue o selo Antonio por onde passar.",
  },
];

const SIDE_IMG = "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwzfHxiYXJiZXIlMjBoYWlyY3V0JTIwYmVhcmR8ZW58MHx8fHwxNzg2ODI3NjY0fDA&ixlib=rb-4.1.0&q=85";

export default function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="manifesto" ref={ref} data-testid="manifesto-section" className="relative py-24 lg:py-36 px-5 lg:px-8 bg-petrol-900 grain overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-mono-label text-crimson-bright mb-4">— Capítulo IV · A Filosofia</p>
            <h2 className="font-display font-bold uppercase text-3xl sm:text-4xl lg:text-5xl text-cream leading-tight mb-14" data-testid="manifesto-title">
              Nosso <span className="text-gold-gradient">Manifesto</span>
            </h2>
          </motion.div>

          <div className="space-y-12">
            {CHAPTERS.map((c, idx) => (
              <motion.div
                key={c.number}
                data-testid={`manifesto-chapter-${c.number}`}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-6 lg:gap-8 border-l border-gold/25 pl-6 lg:pl-8"
              >
                <span className="font-mono text-gold text-sm pt-1.5 shrink-0">{c.number}</span>
                <div>
                  <h3 className="font-serif-alt font-semibold text-2xl text-cream mb-3">{c.heading}</h3>
                  <p className="text-cream/55 text-sm leading-relaxed">{c.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:sticky lg:top-28"
        >
          <div className="overflow-hidden gold-frame aspect-[4/5]">
            <motion.img style={{ y: imgY }} src={SIDE_IMG} alt="Barbeiro Antonio em ação" className="w-full h-[116%] object-cover -mt-[8%]" />
          </div>
          <div className="absolute -bottom-5 -left-5 bg-crimson px-6 py-4 border border-gold/40">
            <p className="font-display text-cream text-lg tracking-wider">DESDE 1984</p>
            <p className="font-mono-label text-cream/70 text-[0.55rem] mt-1">Três gerações de mestres barbeiros</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
