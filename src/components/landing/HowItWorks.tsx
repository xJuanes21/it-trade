"use client";

import { Download, Sliders, TrendingUp } from "lucide-react";

const steps = [
  {
    order: 1,
    icon: Download,
    title: "Conecta tu Cuenta",
    description: "Vincula tu cuenta de MT5 de forma segura. Tus fondos siempre permanecen en tu broker, nosotros solo ejecutamos las operaciones."
  },
  {
    order: 2,
    icon: Sliders,
    title: "Selecciona tu Estrategia",
    description: "Elige entre nuestros bots pre-configurados o personaliza tus propios parámetros de riesgo y horarios de operación."
  },
  {
    order: 3,
    icon: TrendingUp,
    title: "Empieza a Ganar",
    description: "Activa el bot y relájate. Nuestro sistema operará automáticamente 24/7 siguiendo la estrategia seleccionada."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Empieza en 3 Simples Pasos
          </h2>
          <p className="text-gray-400 text-lg">
            No necesitas ser un experto en trading. Nuestra plataforma está diseñada para que cualquiera pueda empezar en minutos.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 z-0"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-background border-4 border-secondary flex items-center justify-center mb-8 shadow-xl relative group">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse group-hover:bg-blue-500/30 transition-colors"></div>
                <step.icon size={32} className="text-blue-500 relative z-10" />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-600 border-4 border-background flex items-center justify-center text-white font-bold text-sm">
                  {step.order}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                {step.title}
              </h3>
              
              <p className="text-gray-400 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
