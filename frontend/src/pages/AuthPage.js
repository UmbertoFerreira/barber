import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scissors } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { LogoEmblem } from "@/components/Logo";

const inputCls = "w-full bg-petrol-950/70 border border-white/15 focus:border-gold px-4 py-3.5 text-cream text-sm outline-none transition-colors placeholder:text-cream/30";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = mode === "login" ? await login(email, password) : await register(name, email, password);
      toast.success(mode === "login" ? `Bem-vindo de volta, ${user.name}!` : "Cadastro criado com sucesso!");
      navigate(user.role === "admin" ? "/admin" : "/cliente");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="auth-page" className="min-h-screen bg-petrol-950 grain relative flex items-center justify-center px-5 py-16">
      <div className="absolute inset-0 spotlight pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <Link to="/" data-testid="auth-logo-link"><LogoEmblem size={100} /></Link>
          <h1 className="font-display font-bold uppercase text-2xl text-cream mt-5 text-center" data-testid="auth-title">
            {mode === "login" ? "Entrar na sua conta" : "Criar cadastro"}
          </h1>
          <p className="font-serif-alt italic text-cream/50 mt-2 text-center">
            {mode === "login" ? "Sua cadeira está esperando." : "Junte-se ao clube dos gentlemen."}
          </p>
        </div>

        <div className="bg-petrol-900/80 border border-gold/25 p-7 lg:p-9 backdrop-blur-md">
          <div className="grid grid-cols-2 mb-7 border border-gold/20">
            <button
              data-testid="auth-tab-login"
              onClick={() => setMode("login")}
              className={`py-3 font-mono-label transition-colors ${mode === "login" ? "bg-gold text-petrol-950" : "text-cream/60 hover:text-gold"}`}
            >
              Entrar
            </button>
            <button
              data-testid="auth-tab-register"
              onClick={() => setMode("register")}
              className={`py-3 font-mono-label transition-colors ${mode === "register" ? "bg-gold text-petrol-950" : "text-cream/60 hover:text-gold"}`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <input
                data-testid="auth-name-input"
                type="text"
                required
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
              />
            )}
            <input
              data-testid="auth-email-input"
              type="email"
              required
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
            <input
              data-testid="auth-password-input"
              type="password"
              required
              minLength={6}
              placeholder="Senha (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
            <button
              data-testid="auth-submit-button"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-crimson text-cream font-mono-label font-semibold hover:bg-crimson-bright transition-colors disabled:opacity-60"
            >
              <Scissors size={15} />
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar Conta"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <Link to="/" data-testid="auth-back-home" className="font-mono-label text-cream/40 hover:text-gold transition-colors">
            ← Voltar ao site
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
