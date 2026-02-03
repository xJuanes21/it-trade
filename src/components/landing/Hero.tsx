"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle, BarChart2, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-32 bg-background">
      {/* Dynamic background lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px]" />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left pt-8 lg:pt-0 animate-slide-in-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 neumorphic-inset">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Nuevo Algoritmo V3.0 Disponible
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black leading-tight text-white mb-8 tracking-tighter">
              Trading <span className="text-gray-500">Automático</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">
                Impulsado por IA
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Maximiza tus ganancias con bots de trading de alta frecuencia.
              Diseñados para el mercado actual,{" "}
              <span className="text-white italic">100% automatizado</span> y
              seguro.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-10 py-5 text-white font-bold text-lg transition-all hover:bg-blue-500 hover:shadow-[0_20px_40px_rgba(59,130,246,0.25)] hover:-translate-y-1 active:scale-95 group"
              >
                Empezar Gratis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button className="w-full sm:w-auto neumorphic-button flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-10 py-5 text-white font-bold text-lg hover:bg-white/10 transition-all hover:-translate-y-1 active:scale-95">
                <PlayCircle className="h-6 w-6 text-blue-400" />
                Ver Demo
              </button>
            </div>

            <div className="mt-16 flex items-center justify-center lg:justify-start gap-10 text-sm">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-slate-800 border-4 border-background flex items-center justify-center text-[10px] font-black text-white neumorphic-outset"
                    >
                      U{i}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-base line-height-1">
                    +500
                  </span>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                    Traders activos
                  </span>
                </div>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="flex flex-col">
                <span className="text-white font-black text-base line-height-1">
                  $2.5M+
                </span>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                  Volumen total
                </span>
              </div>
            </div>
          </div>

          {/* Visual Content */}
          <div className="flex-1 w-full max-w-[600px] lg:max-w-none perspective-1000 animate-slide-in-right">
            <div className="relative animate-float duration-[8000ms]">
              {/* Main Card */}
              <div className="neumorphic-outset backdrop-blur-3xl rounded-[2.5rem] p-8 relative z-20 overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 p-8">
                  <div className="bg-blue-500/20 p-4 rounded-2xl neumorphic-outset">
                    <BarChart2 className="text-blue-400 h-8 w-8" />
                  </div>
                </div>

                <div className="mb-8 p-2">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">
                    Rendimiento Histórico
                  </p>
                  <h3 className="text-5xl font-black text-white tracking-tighter">
                    $12.4K{" "}
                    <span className="text-green-500 text-lg align-top ml-2">
                      +12.5%
                    </span>
                  </h3>
                </div>

                {/* Chart Area */}
                <div className="h-72 w-full neumorphic-inset rounded-3xl relative overflow-hidden mb-8 group">
                  {/* Grid */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                  {/* Candlestick Chart SVG */}
                  <svg
                    className="absolute inset-0 w-full h-full p-4"
                    viewBox="0 0 400 200"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <filter
                        id="glow"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                      >
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite
                          in="SourceGraphic"
                          in2="blur"
                          operator="over"
                        />
                      </filter>
                    </defs>

                    {/* Candles Group - Simulated Data */}
                    <g transform="translate(10, 20) scale(0.95)">
                      {/* Candle Series */}
                      <g className="opacity-80 transition-opacity group-hover:opacity-100">
                        {/* Candle 1: Red */}
                        <rect
                          x="15"
                          y="80"
                          width="12"
                          height="40"
                          fill="#ef4444"
                          rx="2"
                        />

                        {/* Candle 2: Green */}
                        <rect
                          x="45"
                          y="70"
                          width="12"
                          height="30"
                          fill="#22c55e"
                          rx="2"
                        />

                        {/* Candle 3: Red */}
                        <rect
                          x="75"
                          y="90"
                          width="12"
                          height="20"
                          fill="#ef4444"
                          rx="2"
                        />

                        {/* Candle 4: Red (Big Drop) */}
                        <rect
                          x="105"
                          y="100"
                          width="12"
                          height="60"
                          fill="#ef4444"
                          rx="2"
                        />

                        {/* Candle 5: Red */}
                        <rect
                          x="135"
                          y="140"
                          width="12"
                          height="30"
                          fill="#ef4444"
                          rx="2"
                        />

                        {/* Candle 6: Green (Reversal) */}
                        <rect
                          x="165"
                          y="110"
                          width="12"
                          height="40"
                          fill="#22c55e"
                          rx="2"
                        />

                        {/* Candle 7: Green */}
                        <rect
                          x="195"
                          y="80"
                          width="12"
                          height="40"
                          fill="#22c55e"
                          rx="2"
                        />

                        {/* Candle 8: Red (Pullback) */}
                        <rect
                          x="225"
                          y="90"
                          width="12"
                          height="20"
                          fill="#ef4444"
                          rx="2"
                        />

                        {/* Candle 9: Green (Growth) */}
                        <rect
                          x="255"
                          y="60"
                          width="12"
                          height="50"
                          fill="#22c55e"
                          rx="2"
                        />

                        {/* Candle 10: Green (Big Pump) */}
                        <rect
                          x="285"
                          y="20"
                          width="12"
                          height="70"
                          fill="#22c55e"
                          rx="2"
                        />

                        {/* Candle 11: Green (Doji/Top) */}
                        <rect
                          x="315"
                          y="25"
                          width="12"
                          height="10"
                          fill="#22c55e"
                          rx="2"
                        />

                        {/* Candle 12: Red (Correction Start) */}
                        <rect
                          x="345"
                          y="30"
                          width="12"
                          height="40"
                          fill="#ef4444"
                          rx="2"
                        />
                      </g>
                    </g>

                    {/* Moving Average Line with Glow */}
                    <path
                      d="M 30 110 C 60 110, 90 130, 120 150 S 180 180, 210 150 S 270 80, 300 80 S 340 70, 370 85"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="opacity-80"
                      filter="url(#glow)"
                    />

                    {/* Active Price Label */}
                    <g transform="translate(350, 85)">
                      <rect
                        x="0"
                        y="-12"
                        width="60"
                        height="24"
                        rx="8"
                        fill="#3b82f6"
                        className="neumorphic-outset"
                      />
                      <text
                        x="30"
                        y="4"
                        textAnchor="middle"
                        fill="white"
                        fontSize="11"
                        fontWeight="900"
                      >
                        1.2576
                      </text>
                    </g>
                  </svg>

                  {/* Overlay Info */}
                  <div className="absolute top-6 left-6 flex gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                        GBP/USD
                      </span>
                      <span className="text-sm font-black text-white">
                        1.2576
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                        Variación 24h
                      </span>
                      <span className="text-sm font-black text-green-500">
                        +0.45%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 neumorphic-inset rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        EURUSD
                      </span>
                      <span className="text-sm font-black text-white">
                        Bot Alpha
                      </span>
                    </div>
                    <span className="text-green-500 font-black text-xs">
                      +$124.5
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 neumorphic-inset rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        BTCUSD
                      </span>
                      <span className="text-sm font-black text-white">
                        Bot Crypto
                      </span>
                    </div>
                    <span className="text-green-500 font-black text-xs">
                      +$89.2
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 neumorphic-outset p-6 rounded-3xl z-30 animate-float delay-700 hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                    <Zap className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      Ejecución
                    </p>
                    <p className="text-xl font-black text-white">0.05ms</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -left-8 neumorphic-outset p-6 rounded-3xl z-30 animate-float delay-1000 hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                    <div className="w-6 h-6 flex items-center justify-center text-green-500 font-black text-sm">
                      %
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      Win Rate
                    </p>
                    <p className="text-xl font-black text-white">87.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
