import { Scissors } from "lucide-react";

const ITEMS = [
  "ANTONIO BARBER",
  "CORTE TRADICIONAL",
  "BARBA IMPERIAL",
  "PERFUMARIA EXCLUSIVA",
  "ALFAIATARIA MASCULINA",
  "ESTILO DE CLASSE",
  "DESDE 1984",
];

function Row() {
  return (
    <div className="flex items-center shrink-0">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center">
          <span className="font-serif-alt italic text-2xl md:text-3xl text-gold/50 whitespace-nowrap px-8">{item}</span>
          <Scissors size={16} className="text-gold/35 rotate-90 shrink-0" />
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div data-testid="editorial-marquee" className="relative py-6 border-y border-gold/15 bg-petrol-900/60 overflow-hidden">
      <div className="flex animate-marquee w-max">
        <Row />
        <Row />
      </div>
    </div>
  );
}
