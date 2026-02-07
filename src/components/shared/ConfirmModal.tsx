"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "info",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-[#0f172a] rounded-2xl border border-white/10 shadow-2xl max-w-md w-full overflow-hidden stat-fade-in relative">
        {/* Top Gradient */}
        <div
          className={`h-1 w-full ${type === "danger" ? "bg-red-500" : "bg-blue-500"}`}
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${type === "danger" ? "bg-red-500/10" : "bg-blue-500/10"}`}
            >
              <AlertCircle
                className={`w-6 h-6 ${type === "danger" ? "text-red-400" : "text-blue-400"}`}
              />
            </div>
            <h3 className="text-xl font-bold text-white leading-tight">
              {title}
            </h3>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all text-sm disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 text-white
                ${
                  type === "danger"
                    ? "bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20"
                    : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                } disabled:opacity-50`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>

        <style jsx>{`
          .stat-fade-in {
            animation: fadeInScale 0.2s cubic-bezier(0, 0, 0.2, 1) forwards;
          }
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
