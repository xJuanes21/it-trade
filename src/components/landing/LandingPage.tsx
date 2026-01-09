"use client";

import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import Stats from "./Stats";
import HowItWorks from "./HowItWorks";
import CallToAction from "./CallToAction";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white selection:bg-blue-500/30">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <CallToAction />
      </main>
      
      <footer className="py-12 border-t border-white/5 bg-black/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} IT Trade. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-blue-400 transition-colors">Términos de Servicio</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
