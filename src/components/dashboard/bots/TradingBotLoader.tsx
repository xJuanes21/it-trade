"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface TradingBotLoaderProps {
  isOpen: boolean;
  mode: "starting" | "stopping";
  duration?: number; // Duration in seconds
  onComplete: () => void;
}

export default function TradingBotLoader({
  isOpen,
  mode,
  duration = 6,
  onComplete,
}: TradingBotLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const messages = {
    starting: [
      "Iniciando sistema...",
      "Conectando con el mercado...",
      "Analizando pares de divisas...",
      "Cargando estrategias...",
      "Verificando parámetros de riesgo...",
      "Sincronizando con MT5...",
      "¡Bot listo para operar!",
    ],
    stopping: [
      "Recibiendo señal de parada...",
      "Deteniendo nuevas operaciones...",
      "Cerrando conexiones activas...",
      "Guardando estado del bot...",
      "Liberando recursos del servidor...",
      "Desconectando del mercado...",
      "Bot detenido correctamente",
    ],
  };

  const currentMessages = messages[mode];

  useEffect(() => {
    if (!isOpen) return;

    const intervalTime = 100; // Update every 100ms
    const totalSteps = (duration * 1000) / intervalTime;
    const progressPerStep = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + progressPerStep;

        // Calculate message index based on progress
        const msgIndex = Math.min(
          Math.floor((newProgress / 100) * (currentMessages.length - 1)),
          currentMessages.length - 2, // Keep the last message for 100%
        );
        setCurrentMessageIndex(msgIndex);

        if (newProgress >= 100) {
          clearInterval(timer);
          setCurrentMessageIndex(currentMessages.length - 1); // Show final message
          setIsCompleted(true);
          setTimeout(onComplete, 1000); // Wait 1s before closing
          return 100;
        }
        return newProgress;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, duration, mode, currentMessages, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl p-8 flex flex-col items-center animate-in zoom-in-95 duration-300">
        {/* Animated Icon Ring */}
        <div className="relative mb-8">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg
            ${
              isCompleted
                ? mode === "starting"
                  ? "bg-green-500/20 text-green-500"
                  : "bg-red-500/20 text-red-500"
                : "bg-primary/10 text-primary"
            } transition-all duration-500`}
          >
            {isCompleted ? (
              mode === "starting" ? (
                <CheckCircle2 size={48} />
              ) : (
                <XCircle size={48} />
              )
            ) : (
              <span className="animate-pulse">
                {mode === "starting" ? "🚀" : "🛑"}
              </span>
            )}
          </div>

          {!isCompleted && (
            <svg
              className="absolute inset-0 w-24 h-24 rotate-[-90deg]"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-secondary"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * progress) / 100}
                className={
                  mode === "starting" ? "text-primary" : "text-red-500"
                }
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
            </svg>
          )}
        </div>

        {/* Status Text */}
        <h3
          className="text-xl font-bold text-center mb-2 animate-in slide-in-from-bottom-2 fade-in duration-300"
          key={currentMessageIndex}
        >
          {currentMessages[currentMessageIndex]}
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {Math.round(progress)}% Completado
        </p>

        {/* Steps Visualizer */}
        <div className="w-full space-y-2 max-h-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-10" />
          {/* We show previous, current, and next 1 message for context if needed, 
               but focusing on the main text is cleaner. 
               Let's show a simple progress bar instead. */}
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ease-linear
                  ${mode === "starting" ? "bg-primary" : "bg-red-500"}
                `}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
