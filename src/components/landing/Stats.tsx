"use client";

export default function Stats() {
  return (
    <section id="stats" className="py-20 border-y border-white/5 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
          
          <div className="p-4">
            <h4 className="text-4xl md:text-5xl font-bold text-white mb-2">$50M+</h4>
            <p className="text-blue-400 text-sm font-medium uppercase tracking-wider">Volumen Mensual</p>
          </div>

          <div className="p-4">
            <h4 className="text-4xl md:text-5xl font-bold text-white mb-2">98.5%</h4>
            <p className="text-green-400 text-sm font-medium uppercase tracking-wider">Uptime</p>
          </div>

          <div className="p-4">
            <h4 className="text-4xl md:text-5xl font-bold text-white mb-2">12k+</h4>
            <p className="text-purple-400 text-sm font-medium uppercase tracking-wider">Trades Ejecutados</p>
          </div>

          <div className="p-4">
            <h4 className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</h4>
            <p className="text-amber-400 text-sm font-medium uppercase tracking-wider">Soporte Técnico</p>
          </div>

        </div>
      </div>
    </section>
  );
}
