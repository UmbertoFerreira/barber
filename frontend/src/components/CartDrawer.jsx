import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api, brl, formatApiError } from "@/lib/api";

export default function CartDrawer() {
  const { items, open, setOpen, removeItem, setQty, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);

  const checkout = async () => {
    if (!user) {
      toast.info("Entre ou cadastre-se para finalizar o pedido");
      setOpen(false);
      navigate("/entrar", { state: { from: "/" } });
      return;
    }
    setPlacing(true);
    try {
      await api.post("/orders", {
        items: items.map((i) => ({ product_id: i.product.id, name: i.product.name, price: i.product.price, qty: i.qty })),
        total,
      });
      clear();
      setOpen(false);
      toast.success("Pedido registrado! Acompanhe na sua Área do Cliente.");
      navigate("/cliente");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            data-testid="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-petrol-950/70 backdrop-blur-sm z-[60]"
          />
          <motion.aside
            data-testid="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-petrol-900 border-l border-gold/25 z-[70] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/15">
              <h3 className="font-display text-gold text-lg tracking-wider">SACOLA</h3>
              <button data-testid="cart-close-button" onClick={() => setOpen(false)} className="text-cream/60 hover:text-gold transition-colors" aria-label="Fechar sacola">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {items.length === 0 && (
                <div data-testid="cart-empty-state" className="h-full flex flex-col items-center justify-center text-center gap-4 text-cream/40">
                  <ShoppingBag size={40} strokeWidth={1.2} />
                  <p className="font-serif-alt text-lg italic">Sua sacola está vazia.<br />Escolha uma fragrância ou peça da coleção.</p>
                </div>
              )}
              {items.map((i) => (
                <motion.div layout key={i.product.id} data-testid={`cart-item-${i.product.id}`} className="flex gap-4 border border-white/10 bg-petrol-800/60 p-3">
                  <div className="w-20 h-24 overflow-hidden flex-shrink-0 gold-frame">
                    {i.product.image ? (
                      <img src={i.product.image} alt={i.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-petrol-800 flex items-center justify-center">
                        <ShoppingBag size={22} className="text-gold/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif-alt text-cream text-base leading-tight truncate">{i.product.name}</p>
                    <p className="font-mono-label text-gold mt-1">{brl(i.product.price)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button data-testid={`cart-qty-minus-${i.product.id}`} onClick={() => setQty(i.product.id, i.qty - 1)} className="p-1 border border-white/15 text-cream/70 hover:border-gold hover:text-gold" aria-label="Diminuir">
                        <Minus size={13} />
                      </button>
                      <span className="font-mono text-sm text-cream w-5 text-center">{i.qty}</span>
                      <button data-testid={`cart-qty-plus-${i.product.id}`} onClick={() => setQty(i.product.id, i.qty + 1)} className="p-1 border border-white/15 text-cream/70 hover:border-gold hover:text-gold" aria-label="Aumentar">
                        <Plus size={13} />
                      </button>
                      <button data-testid={`cart-remove-${i.product.id}`} onClick={() => removeItem(i.product.id)} className="ml-auto text-cream/40 hover:text-crimson-bright transition-colors" aria-label="Remover">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-gold/15 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-mono-label text-cream/60">Total</span>
                  <span data-testid="cart-total" className="font-display text-gold text-xl">{brl(total)}</span>
                </div>
                <button
                  data-testid="checkout-button"
                  onClick={checkout}
                  disabled={placing}
                  className="w-full py-4 bg-gold text-petrol-950 font-mono-label font-semibold hover:bg-gold-bright transition-colors duration-300 disabled:opacity-60"
                >
                  {placing ? "Registrando..." : "Finalizar Pedido (Demonstração)"}
                </button>
                <p className="text-center text-cream/35 text-xs font-serif-alt italic">Loja em modo demonstrativo — nenhuma cobrança é feita.</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
