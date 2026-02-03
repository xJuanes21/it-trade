"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="neumorphic-outset rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden group">
          {/* Background Patterns & Glows */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] group-hover:bg-blue-600/20 transition-all duration-700"></div>
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] group-hover:bg-indigo-600/20 transition-all duration-700"></div>

          <div className="relative z-10 max-w-4xl mx-auto animate-fade-in-up">
            <span className="text-blue-500 text-xs font-black uppercase tracking-[0.4em] mb-6 block">
              Únete a la Revolución
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-tight">
              Lleva tu Trading <br />
              <span className="text-gray-500 italic underline decoration-blue-500 underline-offset-8">
                al Siguiente Nivel
              </span>
            </h2>
            <p className="text-gray-400 text-xl md:text-2xl mb-12 leading-relaxed font-medium">
              Únete a miles de traders que ya están automatizando sus ganancias
              con nuestra tecnología. Prueba gratis por 14 días,{" "}
              <span className="text-white">sin compromiso</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-[2rem] bg-blue-600 px-12 py-6 text-white font-black text-xl transition-all hover:bg-blue-500 hover:shadow-[0_25px_50px_rgba(59,130,246,0.3)] hover:-translate-y-1 active:scale-95 group/btn"
              >
                Comenzar Prueba Gratis
                <ArrowRight className="h-6 w-6 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <button
                className="w-full sm:w-auto neumorphic-button px-12 py-6 rounded-[2rem] border border-white/5 text-white font-black text-xl hover:bg-white/5 transition-all hover:-translate-y-1 active:scale-95"
                onClick={() => (window.location.href = "#how-it-works")}
              >
                Más Información
              </button>
            </div>

            <p className="mt-12 text-gray-500 font-bold text-sm tracking-wide">
              No requiere tarjeta de crédito • Cancela en cualquier momento
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
