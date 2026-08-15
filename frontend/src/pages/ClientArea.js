import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarCheck, Package, LogOut, Scissors } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@/context/AuthContext";
import { api, brl, formatApiError } from "@/lib/api";

const TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const BOOKING_STATUS = {
  pendente: "text-gold border-gold/50",
  confirmado: "text-emerald-300 border-emerald-400/50",
  concluido: "text-cream/50 border-white/20",
  cancelado: "text-crimson-bright border-crimson/60",
};

const ORDER_STATUS = {
  recebido: "text-gold border-gold/50",
  preparando: "text-sky-300 border-sky-400/50",
  enviado: "text-emerald-300 border-emerald-400/50",
  entregue: "text-cream/50 border-white/20",
  cancelado: "text-crimson-bright border-crimson/60",
};

const inputCls = "w-full bg-petrol-950/70 border border-white/15 focus:border-gold px-4 py-3.5 text-cream text-sm outline-none transition-colors";

function Badge({ label, map }) {
  return (
    <span className={`font-mono-label text-[0.58rem] px-3 py-1.5 border uppercase ${map[label] || "text-cream/60 border-white/20"}`}>
      {label}
    </span>
  );
}

export default function ClientArea() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("agendar");
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ service_id: "", date: "", time: "09:00", notes: "" });
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    api.get("/bookings/mine").then((r) => setBookings(r.data)).catch(() => {});
    api.get("/orders/mine").then((r) => setOrders(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const ref = sessionStorage.getItem("referencia_corte");
    if (ref) {
      sessionStorage.removeItem("referencia_corte");
      setForm((f) => ({ ...f, notes: `Referência da galeria: ${ref}` }));
      toast.success(`Referência "${ref}" adicionada ao agendamento`);
    }
  }, []);

  useEffect(() => {
    if (user === false) { navigate("/entrar"); return; }
    if (user) {
      api.get("/services").then((r) => {
        setServices(r.data);
        if (r.data[0]) setForm((f) => ({ ...f, service_id: f.service_id || r.data[0].id }));
      }).catch(() => {});
      load();
    }
  }, [user, navigate, load]);

  if (!user) {
    return <div className="min-h-screen bg-petrol-950 flex items-center justify-center"><Scissors className="text-gold animate-spin" /></div>;
  }

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!form.service_id || !form.date) { toast.error("Escolha o serviço e a data"); return; }
    setSending(true);
    try {
      await api.post("/bookings", form);
      toast.success("Agendamento solicitado! Aguarde a confirmação.");
      setForm((f) => ({ ...f, date: "", notes: "" }));
      load();
      setTab("agendamentos");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSending(false);
    }
  };

  const TABS = [
    { id: "agendar", label: "Novo Agendamento" },
    { id: "agendamentos", label: `Meus Agendamentos (${bookings.length})` },
    { id: "pedidos", label: `Meus Pedidos (${orders.length})` },
  ];

  return (
    <div data-testid="client-area" className="min-h-screen bg-petrol-950 grain">
      <Navbar />
      <CartDrawer />
      <main className="max-w-5xl mx-auto px-5 lg:px-8 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="font-mono-label text-crimson-bright mb-3">— Área do Cliente</p>
            <h1 className="font-display font-bold uppercase text-3xl lg:text-4xl text-cream" data-testid="client-greeting">
              Olá, <span className="text-gold-gradient">{user.name?.split(" ")[0]}</span>
            </h1>
          </div>
          <button
            data-testid="client-logout-button"
            onClick={async () => { await logout(); navigate("/"); }}
            className="flex items-center gap-2 px-4 py-2.5 border border-white/15 text-cream/60 font-mono-label hover:text-crimson-bright hover:border-crimson/50 transition-colors w-fit"
          >
            <LogOut size={14} /> Sair
          </button>
        </motion.div>

        <div className="flex flex-wrap gap-px bg-gold/15 border border-gold/15 mb-10">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`client-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[140px] py-3.5 font-mono-label transition-colors ${tab === t.id ? "bg-gold text-petrol-950" : "bg-petrol-900 text-cream/60 hover:text-gold"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "agendar" && (
          <motion.form
            key="agendar"
            data-testid="booking-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={submitBooking}
            className="bg-petrol-900/70 border border-gold/20 p-7 lg:p-10 space-y-6"
          >
            <h2 className="font-serif-alt font-semibold text-2xl text-cream flex items-center gap-3">
              <CalendarCheck className="text-gold" size={22} /> Reserve seu horário
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-mono-label text-cream/50 block mb-2">Serviço</label>
                <select
                  data-testid="booking-service-select"
                  value={form.service_id}
                  onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                  className={inputCls}
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {brl(s.price)}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono-label text-cream/50 block mb-2">Data</label>
                  <input
                    data-testid="booking-date-input"
                    type="date"
                    required
                    value={form.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="font-mono-label text-cream/50 block mb-2">Horário</label>
                  <select
                    data-testid="booking-time-select"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className={inputCls}
                  >
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="font-mono-label text-cream/50 block mb-2">Observações (opcional)</label>
              <textarea
                data-testid="booking-notes-input"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex.: prefiro máquina nas laterais, referência de corte..."
                className={`${inputCls} resize-none placeholder:text-cream/25`}
              />
            </div>
            <button
              data-testid="booking-submit-button"
              type="submit"
              disabled={sending}
              className="px-8 py-4 bg-crimson text-cream font-mono-label font-semibold hover:bg-crimson-bright transition-colors disabled:opacity-60"
            >
              {sending ? "Enviando..." : "Confirmar Agendamento"}
            </button>
          </motion.form>
        )}

        {tab === "agendamentos" && (
          <motion.div key="agendamentos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4" data-testid="client-bookings-list">
            {bookings.length === 0 && (
              <p className="font-serif-alt italic text-cream/40 text-lg py-16 text-center border border-white/10 bg-petrol-900/50">
                Nenhum agendamento ainda. Que tal reservar sua cadeira?
              </p>
            )}
            {bookings.map((b) => (
              <div key={b.id} data-testid={`booking-item-${b.id}`} className="bg-petrol-900/70 border border-white/10 p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div>
                  <h3 className="font-serif-alt font-semibold text-xl text-cream">{b.service_name}</h3>
                  <p className="font-mono text-sm text-gold mt-1">{b.date} às {b.time}</p>
                  {b.notes && <p className="text-cream/45 text-sm mt-2 italic font-serif-alt">"{b.notes}"</p>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-gold text-lg">{brl(b.price)}</span>
                  <Badge label={b.status} map={BOOKING_STATUS} />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {tab === "pedidos" && (
          <motion.div key="pedidos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4" data-testid="client-orders-list">
            {orders.length === 0 && (
              <p className="font-serif-alt italic text-cream/40 text-lg py-16 text-center border border-white/10 bg-petrol-900/50">
                Nenhum pedido ainda. <Link to="/#perfumes" className="text-gold underline underline-offset-4">Conheça a loja</Link>.
              </p>
            )}
            {orders.map((o) => (
              <div key={o.id} data-testid={`order-item-${o.id}`} className="bg-petrol-900/70 border border-white/10 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className="font-mono text-cream/40 text-xs flex items-center gap-2">
                    <Package size={14} className="text-gold" /> Pedido #{o.id.slice(0, 8)}
                  </span>
                  <Badge label={o.status} map={ORDER_STATUS} />
                </div>
                <ul className="space-y-1.5 text-sm text-cream/65">
                  {o.items.map((i, idx) => (
                    <li key={idx} className="flex justify-between gap-4">
                      <span>{i.qty}× {i.name}</span>
                      <span className="text-gold/80 font-mono">{brl(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between mt-4 pt-4 border-t border-white/10">
                  <span className="font-mono-label text-cream/50">Total</span>
                  <span className="font-display text-gold text-lg">{brl(o.total)}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
