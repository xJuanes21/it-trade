"use client";

import React from "react";
import SolicitudesView from "@/components/dashboard/copy-trader/traders/SolicitudesView";
import { Users, ShieldCheck } from "lucide-react";

export default function SolicitudesPage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground uppercase">
              Gestión de Solicitudes
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-xl font-medium ml-5">
            Panel de control para Traders: Aprueba o rechaza solicitudes de 
            asociación de cuentas Slave para tu estrategia master.
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <SolicitudesView />
    </div>
  );
}
