"use client";

import { ShieldCheck, Cpu, BarChart3, Clock, Zap, Globe } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Trading 24/7",
    description:
      "Nuestros bots nunca duermen. Operan día y noche para que no pierdas ninguna oportunidad del mercado.",
  },
  {
    icon: Cpu,
    title: "IA Avanzada",
    description:
      "Algoritmos que aprenden y se adaptan a las condiciones cambiantes del mercado en tiempo real.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad Total",
    description:
      "Tus fondos permanecen en tu broker. Nosotros solo enviamos las señales de operación a través de API segura.",
  },
  {
    icon: Zap,
    title: "Ejecución Ultra-rápida",
    description:
      "Latencia mínima para asegurar los mejores precios de entrada y salida en cada operación.",
  },
  {
    icon: BarChart3,
    title: "Análisis en Tiempo Real",
    description:
      "Dashboard completo para monitorear el rendimiento de tus bots y ajustar estrategias.",
  },
  {
    icon: Globe,
    title: "Multi-Mercado",
    description:
      "Opera en Forex, Cripto y Materias Primas simultáneamente con diferentes estrategias.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-20 animate-fade-in-up">
          <span className="text-blue-500 text-xs font-black uppercase tracking-[0.3em] mb-4 block">
            Potencia tu Capital
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            Tecnología de Punta <br />
            <span className="text-gray-500">para tus Inversiones</span>
          </h2>
          <div className="h-1.5 w-24 bg-blue-600 rounded-full mx-auto mb-8"></div>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Combinamos lo mejor del análisis técnico tradicional con el poder de
            la inteligencia artificial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="neumorphic-outset hover:neumorphic-inset p-10 rounded-[2.5rem] transition-all duration-500 group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 neumorphic-outset rounded-2xl flex items-center justify-center mb-8 text-blue-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <feature.icon size={30} strokeWidth={2.5} />
              </div>

              <h3 className="text-2xl font-black text-white mb-5 tracking-tight">
                {feature.title}
              </h3>

              <p className="text-gray-400 leading-relaxed font-medium group-hover:text-gray-300 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
