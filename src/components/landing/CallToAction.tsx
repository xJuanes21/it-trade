"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900 border border-white/10 p-12 md:p-20 text-center">
          
          {/* Background Patterns */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px]"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
              Lleva tu Trading al Siguiente Nivel Hoy Mismo
            </h2>
            <p className="text-blue-100 text-lg md:text-xl mb-10 leading-relaxed">
              Únete a miles de traders que ya están automatizando sus ganancias con nuestra tecnología.
              Prueba gratis por 14 días, sin compromiso.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white text-blue-900 px-8 py-4 font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg shadow-black/20"
              >
                Comenzar Prueba Gratis
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button 
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
                onClick={() => window.location.href = '#how-it-works'}
              >
                Más Información
              </button>
            </div>

            <p className="mt-8 text-sm text-blue-200/60">
              No requiere tarjeta de crédito para empezar • Cancelación en cualquier momento
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
