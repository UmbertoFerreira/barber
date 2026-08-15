import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, SprayCan, Shirt } from "lucide-react";
import { toast } from "sonner";
import { api, brl } from "@/lib/api";
import { useCart } from "@/context/CartContext";

function ProductCard({ product, idx, variant }) {
  const { addItem } = useCart();
  return (
    <motion.article
      data-testid={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative ${variant === "cloth" && idx % 2 === 1 ? "md:translate-y-12" : ""}`}
    >
      <div className={`relative overflow-hidden ${variant === "perfume" ? "spotlight" : ""}`}>
        <div className={`overflow-hidden ${variant === "perfume" ? "aspect-[3/4] gold-frame" : "aspect-[4/5] border border-white/10"}`}>
          {product.image ? (
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.07 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : (
            <div className="w-full h-full bg-petrol-800 flex flex-col items-center justify-center gap-4 spotlight">
              {variant === "perfume"
                ? <SprayCan size={56} strokeWidth={1} className="text-gold/50" />
                : <Shirt size={56} strokeWidth={1} className="text-gold/50" />}
              <span className="font-mono-label text-cream/30 text-[0.6rem]">Foto em breve</span>
            </div>
          )}
        </div>
        {product.tag && (
          <span className="absolute top-4 left-4 bg-crimson text-cream font-mono-label text-[0.58rem] px-3 py-1.5" data-testid={`product-tag-${product.id}`}>
            {product.tag}
          </span>
        )}
      </div>
      <div className="pt-6">
        <h3 className="font-serif-alt font-semibold text-xl lg:text-2xl text-cream leading-snug">{product.name}</h3>
        {product.notes && <p className="text-cream/50 text-sm mt-2 font-serif-alt italic leading-relaxed">{product.notes}</p>}
        <div className="flex items-center justify-between mt-5">
          <span data-testid={`product-price-${product.id}`} className="font-display text-gold text-xl">{brl(product.price)}</span>
          <button
            data-testid={`product-add-cart-${product.id}`}
            onClick={() => { addItem(product); toast.success(`${product.name} adicionado à sacola`); }}
            className="flex items-center gap-2 px-4 py-2.5 border border-gold/40 text-gold font-mono-label hover:bg-gold hover:text-petrol-950 transition-colors duration-300"
          >
            <ShoppingBag size={14} /> Comprar
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function SectionHeader({ eyebrow, title, accent, description, icon: Icon, testId }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="mb-14"
    >
      <p className="font-mono-label text-crimson-bright mb-4 flex items-center gap-2">
        <Icon size={14} /> {eyebrow}
      </p>
      <h2 className="font-display font-bold uppercase text-3xl sm:text-4xl lg:text-5xl text-cream leading-tight" data-testid={testId}>
        {title} <span className="text-gold-gradient">{accent}</span>
      </h2>
      <p className="font-serif-alt italic text-cream/60 text-lg mt-4 max-w-xl leading-relaxed">{description}</p>
    </motion.div>
  );
}

export default function Shop() {
  const [perfumes, setPerfumes] = useState([]);
  const [clothes, setClothes] = useState([]);

  useEffect(() => {
    api.get("/products?category=perfume").then((res) => setPerfumes(res.data)).catch(() => {});
    api.get("/products?category=vestuario").then((res) => setClothes(res.data)).catch(() => {});
  }, []);

  return (
    <>
      <section id="perfumes" data-testid="perfumes-section" className="relative py-24 lg:py-36 px-5 lg:px-8 bg-petrol-900 grain overflow-hidden">
        <div className="absolute inset-0 spotlight pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <SectionHeader
            eyebrow="Loja · Perfumes"
            title="Perfumes"
            accent="da casa"
            description="Fragrâncias pra você sair daqui cheirosão."
            icon={SprayCan}
            testId="perfumes-title"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {perfumes.map((p, idx) => <ProductCard key={p.id} product={p} idx={idx} variant="perfume" />)}
          </div>
        </div>
      </section>

      <section id="vestuario" data-testid="clothing-section" className="relative py-24 lg:py-36 px-5 lg:px-8 bg-petrol-950 grain">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Loja · Roupas"
            title="Roupas"
            accent="& acessórios"
            description="Camisetas, jaquetas e acessórios com a marca da casa."
            icon={Shirt}
            testId="clothing-title"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 md:pb-12">
            {clothes.map((p, idx) => <ProductCard key={p.id} product={p} idx={idx} variant="cloth" />)}
          </div>
        </div>
      </section>
    </>
  );
}
