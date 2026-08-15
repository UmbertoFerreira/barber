import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, Pencil, Trash2, X, CalendarCheck, Package, Scissors } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api, brl, formatApiError, imgUrl } from "@/lib/api";

const inputCls = "w-full bg-petrol-950/70 border border-white/15 focus:border-gold px-4 py-3 text-cream text-sm outline-none transition-colors placeholder:text-cream/30";
const selectCls = inputCls;

const BOOKING_STATUSES = ["pendente", "confirmado", "concluido", "cancelado"];
const ORDER_STATUSES = ["recebido", "preparando", "enviado", "entregue", "cancelado"];

const EMPTY_SERVICE = { name: "", description: "", duration: "", price: "", active: true };
const EMPTY_PRODUCT = { name: "", category: "perfume", price: "", notes: "", tag: "", image: "", stock: 10, active: true };

const DAY_NAMES = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const HOUR_OPTIONS = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, "0")}:00`);

function Modal({ title, onClose, children, testId }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-petrol-950/80 backdrop-blur-sm flex items-center justify-center p-5"
      onClick={onClose}
    >
      <motion.div
        data-testid={testId}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-petrol-900 border border-gold/30 p-7 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-gold text-lg tracking-wider uppercase">{title}</h3>
          <button data-testid={`${testId}-close`} onClick={onClose} className="text-cream/50 hover:text-gold" aria-label="Fechar"><X size={20} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function AdminArea() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("agendamentos");
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [serviceModal, setServiceModal] = useState(null); // {data, id?}
  const [productModal, setProductModal] = useState(null);
  const [hours, setHours] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadProductImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setProductModal((m) => ({ ...m, data: { ...m.data, image: data.url } }));
      toast.success("Foto enviada");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const loadAll = useCallback(() => {
    api.get("/admin/bookings").then((r) => setBookings(r.data)).catch(() => {});
    api.get("/admin/orders").then((r) => setOrders(r.data)).catch(() => {});
    api.get("/admin/services").then((r) => setServices(r.data)).catch(() => {});
    api.get("/admin/products").then((r) => setProducts(r.data)).catch(() => {});
    api.get("/settings/hours").then((r) => setHours(r.data.days)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user === false) { navigate("/entrar"); return; }
    if (user && user.role !== "admin") { navigate("/cliente"); return; }
    if (user) loadAll();
  }, [user, navigate, loadAll]);

  if (!user || user.role !== "admin") {
    return <div className="min-h-screen bg-petrol-950 flex items-center justify-center"><Shield className="text-gold animate-pulse" /></div>;
  }

  const patchBooking = async (id, status) => {
    try {
      await api.patch(`/admin/bookings/${id}`, { status });
      toast.success(`Agendamento ${status}`);
      loadAll();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  const patchOrder = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}`, { status });
      toast.success(`Pedido atualizado: ${status}`);
      loadAll();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  const saveService = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...serviceModal.data, price: parseFloat(serviceModal.data.price) || 0 };
    try {
      if (serviceModal.id) await api.put(`/admin/services/${serviceModal.id}`, payload);
      else await api.post("/admin/services", payload);
      toast.success("Serviço salvo");
      setServiceModal(null);
      loadAll();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setSaving(false); }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...productModal.data, price: parseFloat(productModal.data.price) || 0, stock: parseInt(productModal.data.stock) || 0 };
    try {
      if (productModal.id) await api.put(`/admin/products/${productModal.id}`, payload);
      else await api.post("/admin/products", payload);
      toast.success("Produto salvo");
      setProductModal(null);
      loadAll();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setSaving(false); }
  };

  const removeService = async (id) => {
    await api.delete(`/admin/services/${id}`);
    toast.success("Serviço removido");
    loadAll();
  };

  const removeProduct = async (id) => {
    await api.delete(`/admin/products/${id}`);
    toast.success("Produto removido");
    loadAll();
  };

  const TABS = [
    { id: "agendamentos", label: `Agendamentos (${bookings.length})` },
    { id: "servicos", label: `Serviços & Preços (${services.length})` },
    { id: "produtos", label: `Produtos (${products.length})` },
    { id: "pedidos", label: `Pedidos (${orders.length})` },
    { id: "expediente", label: "Expediente" },
  ];

  return (
    <div data-testid="admin-area" className="min-h-screen bg-petrol-950 grain">
      <Navbar />
      <main className="max-w-6xl mx-auto px-5 lg:px-8 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-10">
          <p className="font-mono-label text-crimson-bright mb-3 flex items-center gap-2"><Shield size={14} /> Painel Administrativo</p>
          <h1 className="font-display font-bold uppercase text-3xl lg:text-4xl text-cream" data-testid="admin-title">
            Comando da <span className="text-gold-gradient">Casa</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gold/15 border border-gold/15 mb-10">
          {[
            { label: "Agendamentos", value: bookings.length, icon: CalendarCheck },
            { label: "Serviços", value: services.length, icon: Scissors },
            { label: "Produtos", value: products.length, icon: Package },
            { label: "Pedidos", value: orders.length, icon: Package },
          ].map((s, i) => (
            <div key={s.label} data-testid={`admin-stat-${i}`} className="bg-petrol-900 p-6">
              <s.icon size={18} className="text-gold mb-3" />
              <p className="font-display text-3xl text-cream">{s.value}</p>
              <p className="font-mono-label text-cream/45 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-px bg-gold/15 border border-gold/15 mb-10">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`admin-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[130px] py-3.5 font-mono-label transition-colors ${tab === t.id ? "bg-gold text-petrol-950" : "bg-petrol-900 text-cream/60 hover:text-gold"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "agendamentos" && (
          <div className="space-y-3" data-testid="admin-bookings-list">
            {bookings.length === 0 && <p className="font-serif-alt italic text-cream/40 text-center py-14 border border-white/10">Nenhum agendamento recebido ainda.</p>}
            {bookings.map((b) => (
              <div key={b.id} data-testid={`admin-booking-${b.id}`} className="bg-petrol-900/70 border border-white/10 p-5 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                <div>
                  <p className="font-serif-alt font-semibold text-lg text-cream">{b.service_name}</p>
                  <p className="text-cream/50 text-sm mt-1">{b.user_name} · {b.user_email}</p>
                  <p className="font-mono text-gold text-sm mt-1">{b.date} às {b.time} · {brl(b.price)}</p>
                </div>
                <select
                  data-testid={`admin-booking-status-${b.id}`}
                  value={b.status}
                  onChange={(e) => patchBooking(b.id, e.target.value)}
                  className={`${selectCls} lg:w-44 capitalize`}
                >
                  {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        {tab === "servicos" && (
          <div data-testid="admin-services-list">
            <button
              data-testid="admin-add-service-button"
              onClick={() => setServiceModal({ data: { ...EMPTY_SERVICE } })}
              className="mb-6 flex items-center gap-2 px-5 py-3 bg-gold text-petrol-950 font-mono-label font-semibold hover:bg-gold-bright transition-colors"
            >
              <Plus size={15} /> Novo Serviço
            </button>
            <div className="space-y-3">
              {services.map((s) => (
                <div key={s.id} data-testid={`admin-service-${s.id}`} className="bg-petrol-900/70 border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div>
                    <p className="font-serif-alt font-semibold text-lg text-cream">{s.name} {!s.active && <span className="font-mono-label text-crimson-bright text-[0.55rem] ml-2">INATIVO</span>}</p>
                    <p className="font-mono text-sm text-gold mt-1">{brl(s.price)} · {s.duration}</p>
                  </div>
                  <div className="flex gap-2">
                    <button data-testid={`admin-service-edit-${s.id}`} onClick={() => setServiceModal({ data: { ...s }, id: s.id })} className="p-2.5 border border-gold/40 text-gold hover:bg-gold hover:text-petrol-950 transition-colors" aria-label="Editar"><Pencil size={15} /></button>
                    <button data-testid={`admin-service-delete-${s.id}`} onClick={() => removeService(s.id)} className="p-2.5 border border-crimson/50 text-crimson-bright hover:bg-crimson hover:text-cream transition-colors" aria-label="Excluir"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "produtos" && (
          <div data-testid="admin-products-list">
            <button
              data-testid="admin-add-product-button"
              onClick={() => setProductModal({ data: { ...EMPTY_PRODUCT } })}
              className="mb-6 flex items-center gap-2 px-5 py-3 bg-gold text-petrol-950 font-mono-label font-semibold hover:bg-gold-bright transition-colors"
            >
              <Plus size={15} /> Novo Produto
            </button>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} data-testid={`admin-product-${p.id}`} className="bg-petrol-900/70 border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    {p.image && <img src={imgUrl(p.image)} alt="" className="w-12 h-14 object-cover border border-gold/30" />}
                    <div>
                      <p className="font-serif-alt font-semibold text-lg text-cream">{p.name} {!p.active && <span className="font-mono-label text-crimson-bright text-[0.55rem] ml-2">INATIVO</span>}</p>
                      <p className="font-mono text-sm text-gold mt-1">
                        {brl(p.price)} · <span className={p.category === "perfume" ? "text-gold" : "text-crimson-bright"}>{p.category === "perfume" ? "Perfume" : "Vestuário"}</span> · Estoque: {p.stock}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button data-testid={`admin-product-edit-${p.id}`} onClick={() => setProductModal({ data: { ...p }, id: p.id })} className="p-2.5 border border-gold/40 text-gold hover:bg-gold hover:text-petrol-950 transition-colors" aria-label="Editar"><Pencil size={15} /></button>
                    <button data-testid={`admin-product-delete-${p.id}`} onClick={() => removeProduct(p.id)} className="p-2.5 border border-crimson/50 text-crimson-bright hover:bg-crimson hover:text-cream transition-colors" aria-label="Excluir"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "expediente" && hours && (
          <div data-testid="admin-hours-panel" className="bg-petrol-900/70 border border-gold/20 p-7 lg:p-10">
            <h2 className="font-serif-alt font-semibold text-2xl text-cream mb-2">Dias e horários de funcionamento</h2>
            <p className="text-cream/50 text-sm mb-8 font-serif-alt italic">Os clientes só conseguem agendar dentro do expediente definido aqui.</p>
            <div className="space-y-3">
              {hours.map((d, i) => (
                <div key={i} data-testid={`hours-day-${i}`} className="flex flex-wrap items-center gap-4 bg-petrol-950/60 border border-white/10 p-4">
                  <label className="flex items-center gap-3 w-36 cursor-pointer">
                    <input
                      data-testid={`hours-open-${i}`}
                      type="checkbox"
                      checked={d.open}
                      onChange={(e) => setHours(hours.map((x, j) => j === i ? { ...x, open: e.target.checked } : x))}
                      className="accent-[#D4AF37] w-4 h-4"
                    />
                    <span className="font-mono-label text-cream/80">{DAY_NAMES[i]}</span>
                  </label>
                  {d.open ? (
                    <div className="flex items-center gap-3">
                      <select
                        data-testid={`hours-start-${i}`}
                        value={d.start}
                        onChange={(e) => setHours(hours.map((x, j) => j === i ? { ...x, start: e.target.value } : x))}
                        className={`${selectCls} w-28`}
                      >
                        {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="text-cream/40 font-mono text-sm">até</span>
                      <select
                        data-testid={`hours-end-${i}`}
                        value={d.end}
                        onChange={(e) => setHours(hours.map((x, j) => j === i ? { ...x, end: e.target.value } : x))}
                        className={`${selectCls} w-28`}
                      >
                        {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ) : (
                    <span className="font-mono-label text-crimson-bright text-[0.6rem]">FECHADO</span>
                  )}
                </div>
              ))}
            </div>
            <button
              data-testid="hours-save-button"
              onClick={async () => {
                setSaving(true);
                try {
                  await api.put("/admin/hours", { days: hours });
                  toast.success("Expediente salvo");
                } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
                finally { setSaving(false); }
              }}
              disabled={saving}
              className="mt-8 px-8 py-4 bg-gold text-petrol-950 font-mono-label font-semibold hover:bg-gold-bright transition-colors disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar Expediente"}
            </button>
          </div>
        )}

        {tab === "pedidos" && (
          <div className="space-y-3" data-testid="admin-orders-list">
            {orders.length === 0 && <p className="font-serif-alt italic text-cream/40 text-center py-14 border border-white/10">Nenhum pedido recebido ainda.</p>}
            {orders.map((o) => (
              <div key={o.id} data-testid={`admin-order-${o.id}`} className="bg-petrol-900/70 border border-white/10 p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                  <div>
                    <p className="font-mono text-cream/40 text-xs">Pedido #{o.id.slice(0, 8)} · {o.user_name}</p>
                    <ul className="text-sm text-cream/65 mt-2 space-y-1">
                      {o.items.map((i, idx) => <li key={idx}>{i.qty}× {i.name} — <span className="text-gold/80">{brl(i.price * i.qty)}</span></li>)}
                    </ul>
                    <p className="font-display text-gold mt-2">{brl(o.total)}</p>
                  </div>
                  <select
                    data-testid={`admin-order-status-${o.id}`}
                    value={o.status}
                    onChange={(e) => patchOrder(o.id, e.target.value)}
                    className={`${selectCls} lg:w-44 capitalize`}
                  >
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {serviceModal && (
          <Modal title={serviceModal.id ? "Editar Serviço" : "Novo Serviço"} onClose={() => setServiceModal(null)} testId="service-modal">
            <form onSubmit={saveService} className="space-y-4" data-testid="service-form">
              <input data-testid="service-name-input" required placeholder="Nome do serviço" value={serviceModal.data.name} onChange={(e) => setServiceModal({ ...serviceModal, data: { ...serviceModal.data, name: e.target.value } })} className={inputCls} />
              <textarea data-testid="service-description-input" rows={2} placeholder="Descrição" value={serviceModal.data.description} onChange={(e) => setServiceModal({ ...serviceModal, data: { ...serviceModal.data, description: e.target.value } })} className={`${inputCls} resize-none`} />
              <div className="grid grid-cols-2 gap-4">
                <input data-testid="service-price-input" required type="number" step="0.01" min="0" placeholder="Preço (R$)" value={serviceModal.data.price} onChange={(e) => setServiceModal({ ...serviceModal, data: { ...serviceModal.data, price: e.target.value } })} className={inputCls} />
                <input data-testid="service-duration-input" placeholder="Duração (ex.: 45 min)" value={serviceModal.data.duration} onChange={(e) => setServiceModal({ ...serviceModal, data: { ...serviceModal.data, duration: e.target.value } })} className={inputCls} />
              </div>
              <label className="flex items-center gap-3 text-cream/70 text-sm">
                <input data-testid="service-active-checkbox" type="checkbox" checked={serviceModal.data.active} onChange={(e) => setServiceModal({ ...serviceModal, data: { ...serviceModal.data, active: e.target.checked } })} className="accent-[#D4AF37] w-4 h-4" />
                Serviço ativo (visível no site)
              </label>
              <button data-testid="service-save-button" type="submit" disabled={saving} className="w-full py-3.5 bg-gold text-petrol-950 font-mono-label font-semibold hover:bg-gold-bright transition-colors disabled:opacity-60">
                {saving ? "Salvando..." : "Salvar Serviço"}
              </button>
            </form>
          </Modal>
        )}
        {productModal && (
          <Modal title={productModal.id ? "Editar Produto" : "Novo Produto"} onClose={() => setProductModal(null)} testId="product-modal">
            <form onSubmit={saveProduct} className="space-y-4" data-testid="product-form">
              <input data-testid="product-name-input" required placeholder="Nome do produto" value={productModal.data.name} onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, name: e.target.value } })} className={inputCls} />
              <select data-testid="product-category-select" value={productModal.data.category} onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, category: e.target.value } })} className={inputCls}>
                <option value="perfume">Perfume</option>
                <option value="vestuario">Vestuário</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input data-testid="product-price-input" required type="number" step="0.01" min="0" placeholder="Preço (R$)" value={productModal.data.price} onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, price: e.target.value } })} className={inputCls} />
                <input data-testid="product-stock-input" type="number" min="0" placeholder="Estoque" value={productModal.data.stock} onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, stock: e.target.value } })} className={inputCls} />
              </div>
              <input data-testid="product-tag-input" placeholder="Selo (ex.: Edição Limitada)" value={productModal.data.tag} onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, tag: e.target.value } })} className={inputCls} />
              <input data-testid="product-notes-input" placeholder="Notas / descrição" value={productModal.data.notes} onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, notes: e.target.value } })} className={inputCls} />
              <input data-testid="product-image-input" type="url" placeholder="URL da imagem (opcional)" value={productModal.data.image} onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, image: e.target.value } })} className={inputCls} />
              <div className="flex items-center gap-4">
                <label
                  data-testid="product-image-upload-label"
                  className="flex-1 cursor-pointer text-center px-4 py-3.5 border border-dashed border-gold/40 text-gold font-mono-label hover:bg-gold/10 transition-colors"
                >
                  {uploading ? "Enviando foto..." : "Enviar foto do computador"}
                  <input data-testid="product-image-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadProductImage} disabled={uploading} className="hidden" />
                </label>
                {productModal.data.image && (
                  <img data-testid="product-image-preview" src={imgUrl(productModal.data.image)} alt="Prévia" className="w-14 h-16 object-cover border border-gold/40" />
                )}
              </div>
              <label className="flex items-center gap-3 text-cream/70 text-sm">
                <input data-testid="product-active-checkbox" type="checkbox" checked={productModal.data.active} onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, active: e.target.checked } })} className="accent-[#D4AF37] w-4 h-4" />
                Produto ativo (visível na loja)
              </label>
              <button data-testid="product-save-button" type="submit" disabled={saving} className="w-full py-3.5 bg-gold text-petrol-950 font-mono-label font-semibold hover:bg-gold-bright transition-colors disabled:opacity-60">
                {saving ? "Salvando..." : "Salvar Produto"}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
