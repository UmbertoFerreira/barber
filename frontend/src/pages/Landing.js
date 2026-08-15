import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import Services from "@/components/landing/Services";
import Shop from "@/components/landing/Shop";
import Manifesto from "@/components/landing/Manifesto";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div data-testid="landing-page" className="bg-petrol-950 min-h-screen">
      <Navbar />
      <CartDrawer />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Shop />
        <Manifesto />
      </main>
      <Footer />
    </div>
  );
}
