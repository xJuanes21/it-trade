"use client";

import Image from "next/image";

type StarStyle = {
  left: string;
  top: string;
  animationDelay: string;
  opacity: number;
};

function createSeededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateStars(count: number, seed = 42): StarStyle[] {
  const rand = createSeededRandom(seed);
  return Array.from({ length: count }, () => ({
    left: `${rand() * 100}%`,
    top: `${rand() * 100}%`,
    animationDelay: `${rand() * 3}s`,
    opacity: rand() * 0.7 + 0.3
  }));
}

const STAR_POSITIONS = generateStars(50);

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Estrellas animadas de fondo */}
      <div className="fixed inset-0 pointer-events-none">
        {STAR_POSITIONS.map((style, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={style}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Logo container */}
        <div className="w-32 h-32 mb-12 flex items-center justify-center bg-gradient-to-br from-card to-secondary rounded-3xl shadow-2xl border border-border animate-float">
          <div className="w-24 h-24 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="IT Trade"
              width={96}
              height={29}
              priority
              className="opacity-90"
            />
          </div>
        </div>

        {/* Número 404 grande */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
            404
          </h1>
        </div>

        {/* Mensaje principal */}
        <div className="text-center max-w-md mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Página No Encontrada
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Parece que te has perdido en el espacio. La página que buscas no existe o ha sido movida a otra galaxia.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-semibold transition-all duration-300 hover:bg-muted hover:scale-105 border border-border"
          >
            ← Volver Atrás
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/50"
          >
             Ir al Dashboard
          </button>
        </div>

        {/* Decoración adicional */}
        <div className="mt-16 text-muted-foreground text-sm">
          <p>Error Code: 404 • Lost in Deep Space</p>
        </div>
      </div>

      {/* Efectos de luz de fondo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" 
          style={{ animationDelay: '1s' }} 
        />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
