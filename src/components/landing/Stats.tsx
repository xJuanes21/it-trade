"use client";

const statItems = [
  { label: "Volumen Mensual", value: "$50M+", color: "text-blue-500" },
  { label: "Uptime", value: "98.5%", color: "text-green-500" },
  { label: "Trades Ejecutados", value: "12k+", color: "text-purple-500" },
  { label: "Soporte Técnico", value: "24/7", color: "text-amber-500" },
];

export default function Stats() {
  return (
    <section
      id="stats"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Subtle light effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-blue-600/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="neumorphic-outset p-10 rounded-[2rem] text-center group hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex flex-col items-center">
                <h4 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tighter group-hover:scale-105 transition-transform">
                  {item.value}
                </h4>
                <div className="h-1.5 w-12 bg-blue-600/20 rounded-full mb-4 group-hover:w-20 transition-all duration-300"></div>
                <p
                  className={`${item.color} text-xs font-black uppercase tracking-[0.2em]`}
                >
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
