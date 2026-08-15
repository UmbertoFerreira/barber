import { MapPin, Clock, Phone } from "lucide-react";
import { LogoEmblem } from "@/components/Logo";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="relative bg-petrol-950 border-t border-gold/20 px-5 lg:px-8 pt-20 pb-10 grain">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-14 border-b border-white/10">
          <div className="flex flex-col items-start gap-5">
            <LogoEmblem size={90} />
            <p className="font-serif-alt italic text-cream/55 leading-relaxed max-w-xs">
              Arte, tradição e elegância masculina. Um ritual que atravessa gerações.
            </p>
          </div>
          <div>
            <h4 className="font-mono-label text-gold mb-6">Visite-nos</h4>
            <ul className="space-y-4 text-cream/60 text-sm">
              <li className="flex gap-3"><MapPin size={16} className="text-gold shrink-0 mt-0.5" /> Rua da Navalha, 1984 — Centro Histórico</li>
              <li className="flex gap-3"><Clock size={16} className="text-gold shrink-0 mt-0.5" /> Ter–Sáb · 09h às 19h</li>
              <li className="flex gap-3"><Phone size={16} className="text-gold shrink-0 mt-0.5" /> (11) 90000-1984</li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono-label text-gold mb-6">A Casa</h4>
            <ul className="space-y-3 text-cream/60 text-sm font-serif-alt">
              <li>Serviços & tabela de preços</li>
              <li>Perfumaria fina exclusiva</li>
              <li>Vestuário & alfaiataria urbana</li>
              <li>Área do cliente & agendamentos</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono-label text-cream/35 text-[0.6rem]">© 1984–2026 ANTONIO BARBER · TODOS OS DIREITOS RESERVADOS</p>
          <p className="font-serif-alt italic text-gold/50 text-sm">"O estilo é a lâmina da personalidade."</p>
        </div>
      </div>
    </footer>
  );
}
