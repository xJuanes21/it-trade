"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle, BarChart2, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-32">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left pt-8 lg:pt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Nuevo Algoritmo V3.0 Disponible
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-white mb-6">
              Trading Automático <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Impulsado por IA
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Maximiza tus ganancias con bots de trading de alta frecuencia. 
              Sin configuraciones complejas, 100% automatizado y seguro.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-white font-semibold transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 group"
              >
                Empezar Gratis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-white font-semibold transition-all hover:bg-white/10">
                <PlayCircle className="h-5 w-5 text-blue-400" />
                Ver Demo
              </button>
            </div>
            
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-background flex items-center justify-center text-xs text-white">
                          U {i}
                        </div>
                    ))}
                </div>
                <span>+100 Traders activos</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div>
                <span className="text-white font-bold block">$2.5M+</span>
                Volumen operado
              </div>
            </div>
          </div>

          {/* Visual Content */}
          <div className="flex-1 w-full max-w-[500px] lg:max-w-none perspective-1000">
            <div className="relative animate-float duration-[6000ms]">
                {/* Main Card */}
                <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative z-20">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-gray-400 text-sm">Ganancia Total</p>
                            <h3 className="text-3xl font-bold text-white">$12,450.00</h3>
                        </div>
                        <div className="bg-green-500/20 p-3 rounded-xl">
                            <BarChart2 className="text-green-500 h-6 w-6" />
                        </div>
                    </div>
                    
                    {/* Chart Area */}
                    <div className="h-64 w-full bg-[#0b0f1c] rounded-xl border border-white/5 relative overflow-hidden mb-6">
                        {/* Grid */}
                        <svg className="absolute inset-0 w-full h-full opacity-20" width="100%" height="100%">
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5"/>
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>

                        {/* Candlestick Chart SVG */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="bullGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8"/>
                                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2"/>
                                </linearGradient>
                                <linearGradient id="bearGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8"/>
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2"/>
                                </linearGradient>
                            </defs>
                            
                            {/* Candles Group - Simulated Data */}
                            <g transform="translate(10, 10) scale(0.95)">
                                {/* Candle 1: Red */}
                                <line x1="20" y1="40" x2="20" y2="90" stroke="#ef4444" strokeWidth="1" />
                                <rect x="15" y="50" width="10" height="30" fill="#ef4444" rx="1" />
                                
                                {/* Candle 2: Green */}
                                <line x1="50" y1="80" x2="50" y2="40" stroke="#22c55e" strokeWidth="1" />
                                <rect x="45" y="50" width="10" height="20" fill="#22c55e" rx="1" />

                                {/* Candle 3: Red */}
                                <line x1="80" y1="60" x2="80" y2="100" stroke="#ef4444" strokeWidth="1" />
                                <rect x="75" y="70" width="10" height="20" fill="#ef4444" rx="1" />
                                
                                {/* Candle 4: Red (Big Drop) */}
                                <line x1="110" y1="70" x2="110" y2="140" stroke="#ef4444" strokeWidth="1" />
                                <rect x="105" y="80" width="10" height="50" fill="#ef4444" rx="1" />

                                {/* Candle 5: Red */}
                                <line x1="140" y1="130" x2="140" y2="160" stroke="#ef4444" strokeWidth="1" />
                                <rect x="135" y="140" width="10" height="15" fill="#ef4444" rx="1" />

                                {/* Candle 6: Green (Reversal) */}
                                <line x1="170" y1="150" x2="170" y2="110" stroke="#22c55e" strokeWidth="1" />
                                <rect x="165" y="120" width="10" height="25" fill="#22c55e" rx="1" />

                                {/* Candle 7: Green */}
                                <line x1="200" y1="120" x2="200" y2="80" stroke="#22c55e" strokeWidth="1" />
                                <rect x="195" y="90" width="10" height="20" fill="#22c55e" rx="1" />

                                {/* Candle 8: Red (Pullback) */}
                                <line x1="230" y1="85" x2="230" y2="105" stroke="#ef4444" strokeWidth="1" />
                                <rect x="225" y="90" width="10" height="10" fill="#ef4444" rx="1" />

                                {/* Candle 9: Green (Growth) */}
                                <line x1="260" y1="100" x2="260" y2="50" stroke="#22c55e" strokeWidth="1" />
                                <rect x="255" y="60" width="10" height="30" fill="#22c55e" rx="1" />

                                {/* Candle 10: Green (Big Pump) */}
                                <line x1="290" y1="60" x2="290" y2="10" stroke="#22c55e" strokeWidth="1" />
                                <rect x="285" y="20" width="10" height="40" fill="#22c55e" rx="1" />

                                {/* Candle 11: Green (Doji/Top) */}
                                <line x1="320" y1="20" x2="320" y2="40" stroke="#22c55e" strokeWidth="1" />
                                <rect x="315" y="28" width="10" height="2" fill="#22c55e" rx="1" />
                                
                                {/* Candle 12: Red (Correction Start) */}
                                <line x1="350" y1="25" x2="350" y2="55" stroke="#ef4444" strokeWidth="1" />
                                <rect x="345" y="30" width="10" height="20" fill="#ef4444" rx="1" />
                            </g>
                            
                            {/* Moving Average Line */}
                            <path 
                                d="M 30 70 C 60 70, 90 90, 120 110 S 180 140, 210 110 S 270 40, 300 40 S 340 30, 370 45" 
                                fill="none" 
                                stroke="#3b82f6" 
                                strokeWidth="2"
                                strokeDasharray="4 2"
                                className="opacity-70"
                            />

                            {/* Price Line (Active) */}
                            <line 
                                x1="0" y1="45" x2="400" y2="45" 
                                stroke="#22c55e" 
                                strokeWidth="1" 
                                strokeDasharray="3 3"
                                className="opacity-50"
                            />
                            
                            {/* Active Price Label */}
                            <g transform="translate(350, 45)">
                                <rect x="0" y="-10" width="50" height="20" rx="3" fill="#22c55e" />
                                <text x="25" y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">1.2576</text>
                            </g>
                        </svg>

                         {/* Overlay Info */}
                         <div className="absolute top-4 left-4 flex gap-4">
                             <div className="flex flex-col">
                                 <span className="text-xs text-gray-400">GBP/USD</span>
                                 <span className="text-sm font-bold text-white">1.2576</span>
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-xs text-gray-400">24h Change</span>
                                 <span className="text-sm font-bold text-green-500">+0.45%</span>
                             </div>
                         </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                <span className="text-sm font-medium text-gray-300">Bot #1 (EURUSD)</span>
                            </div>
                            <span className="text-green-400 font-bold text-sm">+$124.50</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                <span className="text-sm font-medium text-gray-300">Bot #2 (BTCUSD)</span>
                            </div>
                            <span className="text-green-400 font-bold text-sm">+$89.20</span>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-10 -right-10 bg-[#151a2e] border border-white/10 p-4 rounded-2xl shadow-xl z-30 animate-float delay-700 hidden md:block">
                     <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                            <Zap className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Ejecución</p>
                            <p className="text-sm font-bold text-white">0.05s</p>
                        </div>
                     </div>
                </div>

                 <div className="absolute -bottom-5 -left-5 bg-[#151a2e] border border-white/10 p-4 rounded-2xl shadow-xl z-30 animate-float delay-1000 hidden md:block">
                     <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 p-2 rounded-lg">
                            <div className="w-5 h-5 flex items-center justify-center text-green-500 font-bold text-xs">%</div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Win Rate</p>
                            <p className="text-sm font-bold text-white">87.5%</p>
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
