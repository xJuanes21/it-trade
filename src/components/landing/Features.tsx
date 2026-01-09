"use client";

import { ShieldCheck, Cpu, BarChart3, Clock, Zap, Globe } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Trading 24/7",
    description: "Nuestros bots nunca duermen. Operan día y noche para que no pierdas ninguna oportunidad del mercado."
  },
  {
    icon: Cpu,
    title: "IA Avanzada",
    description: "Algoritmos que aprenden y se adaptan a las condiciones cambiantes del mercado en tiempo real."
  },
  {
    icon: ShieldCheck,
    title: "Seguridad Total",
    description: "Tus fondos permanecen en tu broker. Nosotros solo enviamos las señales de operación a través de API segura."
  },
  {
    icon: Zap,
    title: "Ejecución Ultra-rápida",
    description: "Latencia mínima para asegurar los mejores precios de entrada y salida en cada operación."
  },
  {
    icon: BarChart3,
    title: "Análisis en Tiempo Real",
    description: "Dashboard completo para monitorear el rendimiento de tus bots y ajustar estrategias."
  },
  {
    icon: Globe,
    title: "Multi-Mercado",
    description: "Opera en Forex, Cripto y Materias Primas simultáneamente con diferentes estrategias."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Tecnología de Punta para tus Inversiones
          </h2>
          <p className="text-gray-400 text-lg">
            Combinamos lo mejor del análisis técnico tradicional con el poder de la inteligencia artificial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-card hover:bg-card/80 border border-white/5 hover:border-blue-500/30 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                <feature.icon size={28} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-100 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
