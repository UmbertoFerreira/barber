import { motion } from "framer-motion";
import { Scissors } from "lucide-react";

const CHAPTERS = [
  {
    number: "01",
    heading: "A Tradição da Lâmina",
    body: "Aqui o corte é feito com calma e capricho, do jeito antigo: navalha, tesoura e atenção total em cada detalhe.",
  },
  {
    number: "02",
    heading: "Lugar de se sentir em casa",
    body: "Chega, senta e relaxa. Toma um café, troca uma ideia e sai renovado — sem pressa e sem enrolação.",
  },
  {
    number: "03",
    heading: "Estilo que marca",
    body: "Corte, barba ou perfume — você sai daqui com a sua marca, do seu jeito, pronto pra qualquer rolê.",
  },
];

export default function Manifesto() {
  return (
    <section id="manifesto" data-testid="manifesto-section" className="relative py-24 lg:py-36 bg-petrol-900 grain overflow-hidden">
      <div className="absolute inset-0 spotlight pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <p className="font-mono-label text-crimson-bright mb-5">— Sobre a casa</p>
          <h2 className="font-display font-bold uppercase text-3xl sm:text-4xl lg:text-5xl text-cream leading-tight" data-testid="manifesto-title">
            Nossa <span className="text-gold-gradient">História</span>
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-24 h-[2px] bg-gold mx-auto mt-8 origin-center"
          />
        </motion.div>

        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-24"
          data-testid="manifesto-quote"
        >
          <p className="font-serif-alt italic text-2xl sm:text-3xl lg:text-4xl text-cream/85 leading-relaxed">
            "Barbearia de verdade não é só cortar cabelo.
            <span className="text-gold"> É cuidar de quem senta na cadeira.</span>"
          </p>
        </motion.blockquote>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gold/15 border border-gold/15">
          {CHAPTERS.map((c, idx) => (
            <motion.article
              key={c.number}
              data-testid={`manifesto-chapter-${c.number}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ backgroundColor: "#152E34" }}
              className="group relative bg-petrol-900 p-8 lg:p-10 transition-colors"
            >
              <span className="font-display text-6xl lg:text-7xl text-gold/15 group-hover:text-gold/30 transition-colors duration-500 leading-none block mb-6">
                {c.number}
              </span>
              <h3 className="font-serif-alt font-semibold text-2xl text-cream mb-4">{c.heading}</h3>
              <p className="text-cream/55 text-sm leading-relaxed">{c.body}</p>
              <span className="absolute top-0 left-0 h-[2px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8"
          data-testid="manifesto-banner"
        >
          <Scissors size={20} className="text-gold rotate-90" />
          <p className="font-display text-gold text-lg lg:text-xl tracking-[0.2em] text-center">
            FEITO COM CAPRICHO · AQUI VOCÊ É DE CASA
          </p>
          <Scissors size={20} className="text-gold -rotate-90" />
        </motion.div>
      </div>
    </section>
  );
}
