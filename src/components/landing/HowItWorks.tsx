"use client";

import { Download, Sliders, TrendingUp } from "lucide-react";

const steps = [
  {
    order: 1,
    icon: Download,
    title: "Conecta tu Cuenta",
    description:
      "Vincula tu cuenta de MT5 de forma segura. Tus fondos siempre permanecen en tu broker, nosotros solo ejecutamos las operaciones.",
  },
  {
    order: 2,
    icon: Sliders,
    title: "Selecciona tu Estrategia",
    description:
      "Elige entre nuestros bots pre-configurados o personaliza tus propios parámetros de riesgo y horarios de operación.",
  },
  {
    order: 3,
    icon: TrendingUp,
    title: "Empieza a Ganar",
    description:
      "Activa el bot y relájate. Nuestro sistema operará automáticamente 24/7 siguiendo la estrategia seleccionada.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block text-blue-400 text-sm font-bold uppercase tracking-wider mb-3 px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
            Proceso Simple
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
            Empieza en{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              3 Simples Pasos
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            No necesitas ser un experto en trading. Nuestra plataforma está
            diseñada para que cualquiera pueda empezar en minutos.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-20 left-[16.666%] right-[16.666%] h-0.5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent blur-sm" />
          </div>

          {steps.map((step, index) => (
            <div key={index} className="relative z-10 group">
              {/* Card */}
              <div className="relative bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm rounded-3xl p-8 border border-gray-800/50 hover:border-blue-500/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
                {/* Step Number Badge */}
                <div className="absolute -top-4 left-8 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                  {step.order}
                </div>

                {/* Icon Container */}
                <div className="mb-6 mt-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <step.icon
                      size={32}
                      className="text-blue-400 group-hover:text-blue-300 transition-colors"
                    />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-50 transition-colors">
                  {step.title}
                </h3>

                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {step.description}
                </p>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/50 transition-all duration-500 rounded-b-3xl" />
              </div>

              {/* Connecting Arrow (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 -right-8 lg:-right-10 z-20">
                  <div className="w-16 lg:w-20 h-0.5 bg-gradient-to-r from-blue-500/40 to-transparent relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-r-2 border-t-2 border-blue-500/60" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
