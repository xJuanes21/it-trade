import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Estrellas animadas de fondo */}
      <div className="fixed inset-0 pointer-events-none">
        {[
          { left: "10%", top: "20%", delay: "0.1s", opacity: 0.3 },
          { left: "25%", top: "45%", delay: "0.5s", opacity: 0.2 },
          { left: "40%", top: "10%", delay: "1.2s", opacity: 0.5 },
          { left: "70%", top: "30%", delay: "0.8s", opacity: 0.4 },
          { left: "85%", top: "60%", delay: "2.1s", opacity: 0.3 },
          { left: "15%", top: "80%", delay: "1.5s", opacity: 0.2 },
          { left: "55%", top: "90%", delay: "0.3s", opacity: 0.6 },
          { left: "90%", top: "15%", delay: "1.7s", opacity: 0.4 },
          { left: "5%", top: "40%", delay: "2.5s", opacity: 0.3 },
          { left: "33%", top: "75%", delay: "0.9s", opacity: 0.5 },
          { left: "62%", top: "12%", delay: "1.1s", opacity: 0.2 },
          { left: "78%", top: "85%", delay: "0.6s", opacity: 0.4 },
          { left: "44%", top: "33%", delay: "2.2s", opacity: 0.3 },
          { left: "12%", top: "55%", delay: "1.8s", opacity: 0.5 },
          { left: "88%", top: "42%", delay: "0.4s", opacity: 0.6 },
          { left: "22%", top: "18%", delay: "1.3s", opacity: 0.4 },
          { left: "58%", top: "68%", delay: "2.4s", opacity: 0.3 },
          { left: "95%", top: "88%", delay: "0.7s", opacity: 0.2 },
          { left: "3%", top: "92%", delay: "1.9s", opacity: 0.5 },
          { left: "50%", top: "50%", delay: "1.4s", opacity: 0.4 },
        ].map((star, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* Efectos de luz de fondo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
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
