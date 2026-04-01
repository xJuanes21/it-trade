"use client";

import React, { useEffect, useState } from "react";
import ModelConfigForm from "@/components/dashboard/copy-trader/ModelConfigForm";
import { Settings2, ShieldAlert, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { tradeCopierService } from "@/services/trade-copier.service";

export default function ConfigsPage() {
  const { data: session, status } = useSession();
  const [masters, setMasters] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // RBAC: Only superadmin or trader can access this page
  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "superadmin" && role !== "trader") {
        redirect("/dashboard/copy-trader/accounts");
      } else {
        // Fetch accounts to check for master
        tradeCopierService.getAccounts()
          .then(res => {
            if (res.status === "success" && res.data?.accounts) {
              setMasters(res.data.accounts.filter((a: any) => a.type === 0));
            }
            setLoadingAccounts(false);
          })
          .catch(err => {
            console.error("Failed to load accounts for configs guard", err);
            setLoadingAccounts(false);
          });
      }
    } else if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status, session]);

  if (status === "loading" || (status === "authenticated" && loadingAccounts)) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-medium">Validando permisos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Settings2 size={24} />
             </div>
             <h1 className="text-3xl font-extrabold tracking-tight">Settings Avanzados</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-xl">
            Gestión técnica pura 1-a-1. Define parámetros de mitigación y multiplicadores de copiado exclusivos (Aplicarán como override).
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Warning for admins about what they are doing */}
      <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 max-w-3xl border-dashed">
         <ShieldAlert className="shrink-0 text-amber-400" size={20} />
         <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest">Atención: Modo Experto (Overrides Técnicos)</p>
            <p className="text-[11px] leading-relaxed opacity-80 font-medium">
              Estas son configuraciones técnicas directas. Los clientes finales NO verán esta interfaz. 
              Úsalas solo para alterar forzosamente estrategias entre Master y Slave específicos.
            </p>
         </div>
      </div>

      {masters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-card/30 rounded-3xl border border-white/5 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-white">Requiere Cuenta Master</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Para poder gestionar Settings directos y aplicar overrides técnicos, primero debes vincular al menos una cuenta operadora con rol MASTER en la sección de Cuentas.
          </p>
        </div>
      ) : (
        <div className="animate-in zoom-in-95 duration-500">
          <ModelConfigForm />
        </div>
      )}
    </div>
  );
}
