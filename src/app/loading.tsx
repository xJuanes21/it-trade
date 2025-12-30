import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Estrellas animadas de fondo */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>

      {/* Efectos de luz de fondo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div 
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" 
          style={{ animationDelay: '1s' }} 
        />
      </div>

      {/* Logo container con animación de respiración */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Círculo de fondo con pulso */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full animate-ping opacity-75" />
          
          {/* Logo con respiración */}
          <div className="relative animate-breathe">
            <Image
              src="/logo.svg"
              alt="IT Trade"
              width={180}
              height={54}
              priority
              className="drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Texto de carga */}
        <div className="mt-8 text-center">
          <p className="text-lg font-medium text-foreground/80 animate-pulse">
            Cargando...
          </p>
        </div>

        {/* Barra de progreso animada */}
        <div className="mt-6 w-64 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}
