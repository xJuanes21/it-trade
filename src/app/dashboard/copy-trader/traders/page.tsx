"use client";

import React, { useState, useEffect } from "react";
import { tradeCopierService } from "@/services/trade-copier.service";
import { Users, Activity, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Account } from "@/lib/copy-trader-types";
import { tradeCopierAdapter } from "@/lib/trade-copier-adapter";
import { useRouter } from "next/navigation";
import { TradersList } from "@/components/dashboard/copy-trader/traders/TradersList";
import { TraderDetailPanel } from "@/components/dashboard/copy-trader/traders/TraderDetailPanel";
import { useSession } from "next-auth/react";

export interface TraderProfile {
  trader: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  masterAccount: Account | null;
}

export default function TradersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<TraderProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProfile, setSelectedProfile] = useState<TraderProfile | null>(
    null,
  );
  const [traderData, setTraderData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Lógica de filtrado modular y extensible
  const filteredProfiles = profiles.filter((p) => {
    // REQUERIMIENTO: Solo usuarios con rol 'trader'
    const isTrader = p.trader.role === "trader";

    // Aquí se pueden añadir más filtros en el futuro
    return isTrader;
  });

  // Cargar Directorio de Traders Reales
  useEffect(() => {
    const fetchTradersDirectory = async () => {
      setLoading(true);
      try {
        // 1. Obtener lista de usuarios con credenciales (Solo Traders Activos)
        const tradersRes = await fetch("/api/v1/traders?hasCredentials=true");
        const tradersData = await tradersRes.json();

        if (!tradersData.traders)
          throw new Error("No se pudieron cargar los traders");

        // 2. Simplificar carga inicial: Solo datos locales básicos
        const results = tradersData.traders.map((trader: any) => ({
          trader: {
            id: trader.id,
            name: trader.name,
            email: trader.email,
            role: trader.role,
          },
          masterAccount: null, // Se cargará bajo demanda
        }));

        setProfiles(results as TraderProfile[]);
      } catch (error: any) {
        toast.error("Error al cargar el directorio");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTradersDirectory();
  }, []);

  const handleSelectTrader = async (profile: TraderProfile) => {
    setSelectedProfile(profile);
    setLoadingDetails(true);
    setTraderData(null);

    try {
      // 1. Obtener Cuenta Master bajo demanda si no existe
      let masterAcc = profile.masterAccount;

      if (!masterAcc) {
        const accountsRes = await fetch("/api/v1/trade-copier/account/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: profile.trader.id }),
        });
        const accountsData = await accountsRes.json();

        if (
          accountsRes.status === 200 &&
          accountsData.status === "success" &&
          Array.isArray(accountsData.data?.accounts)
        ) {
          masterAcc = accountsData.data.accounts.find(
            (acc: Account) => Number(acc.type) === 0,
          );

          if (masterAcc) {
            // Actualizar perfil localmente para no repetir la carga si se vuelve a clickear
            setProfiles((prev) =>
              prev.map((p) =>
                p.trader.id === profile.trader.id
                  ? { ...p, masterAccount: masterAcc }
                  : p,
              ),
            );
            setSelectedProfile({ ...profile, masterAccount: masterAcc });
          }
        }
      }

      if (!masterAcc) {
        toast.error("No se encontró la información del trader");
        return;
      }

      // 2. Obtener reporte real vía proxy de impersonación
      const res = await fetch("/api/v1/trade-copier/reporting/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: profile.trader.id,
          account_id: masterAcc.account_id,
        }),
      });

      const result = await res.json();

      if (res.ok && result.status === "success") {
        // En el proxy de reporte, los datos vienen en data.reporting
        // Como estamos filtrando por account_id, tomamos el primer reporte
        const reportingData = result.data.reporting[0];
        setTraderData(reportingData);
      } else {
        toast.error("No se pudieron cargar las estadísticas reales");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error de conexión al cargar estadísticas");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCopy = () => {
    if (!selectedProfile || !selectedProfile.masterAccount) return;
    router.push(
      `/dashboard/copy-trader/accounts?mode=add&type=1&groupid=${selectedProfile.masterAccount.account_id}`,
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10 relative h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-primary rounded-full" />
            <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
              Directorio de Traders
            </h1>
          </div>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] ml-5 opacity-60">
            Algorithmic & Institutional Portfolio Overview
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-white/5 to-transparent shrink-0" />

      {/* Main Split Pane Layout */}
      <div className="flex flex-1 gap-8 relative overflow-hidden px-2">
        <div
          className={cn(
            "flex-1 overflow-y-auto no-scrollbar transition-all duration-700 ease-in-out",
            selectedProfile ? "pr-4" : "",
          )}
        >
          <TradersList
            profiles={filteredProfiles}
            selectedTraderId={selectedProfile?.masterAccount?.account_id}
            onSelect={handleSelectTrader}
            isLoading={loading}
          />
        </div>

        <TraderDetailPanel
          selectedTrader={selectedProfile?.masterAccount ?? null}
          traderData={traderData}
          isLoading={loadingDetails}
          userRole={session?.user?.role || "user"}
          onClose={() => {
            setSelectedProfile(null);
            setTraderData(null);
          }}
          onCopy={handleCopy}
          isOpen={!!selectedProfile}
          traderId={selectedProfile?.trader.id || ""}
        />
      </div>
    </div>
  );
}
