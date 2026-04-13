"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Users, 
  Key, 
  CheckCircle2, 
  Circle, 
  Search,
  Settings2,
  X,
  ShieldCheck,
  Activity,
  UserCheck
} from "lucide-react";
import TradeCopierKeysForm from "./TradeCopierKeysForm";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface TraderStatus {
  id: string;
  name: string | null;
  email: string;
  role: string;
  hasCredentials: boolean;
  updatedAt: string | null;
}

export default function PlatformAuthManager() {
  const { data: session } = useSession();
  const [openSection, setOpenSection] = useState<string | null>("mis-credenciales");
  const [traders, setTraders] = useState<TraderStatus[]>([]);
  const [loadingTraders, setLoadingTraders] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrader, setSelectedTrader] = useState<TraderStatus | null>(null);
  const [adminHasCreds, setAdminHasCreds] = useState(false);

  // Fetch Admin status and Traders status
  const loadData = async () => {
    try {
      // 1. Admin status
      const adminRes = await fetch("/api/v1/credentials-api");
      const adminData = await adminRes.json();
      setAdminHasCreds(adminData.hasCredentials);

      // 2. All potential users status (SuperAdmin can see all to provision them)
      const tradersRes = await fetch("/api/v1/traders?all=true");
      const tradersData = await tradersRes.json();
      
      const tradersList: any[] = tradersData.traders || [];
      
      const finalTraders = tradersList.map(t => ({
        ...t,
        hasCredentials: !!t.credentialsApi,
        updatedAt: t.credentialsApi?.updatedAt || null
      }));
      
      setTraders(finalTraders);
    } catch (error) {
      console.error("Error loading auth data:", error);
      toast.error("Error al cargar estados de autenticación");
    } finally {
      setLoadingTraders(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  // Filter out self and search query
  const filteredTraders = traders
    .filter(t => String(t.id) !== String(session?.user?.id)) // EXCLUDE SELF ROBUSTLY
    .filter(t => 
      (t.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      {/* SECTION 1: MY CREDENTIALS */}
      <div className="glass-widget overflow-hidden border-white/5 bg-background/20 rounded-3xl shrink-0">
        <button
          onClick={() => toggleSection("mis-credenciales")}
          className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              adminHasCreds ? "bg-green-500/10 text-green-400" : "bg-primary/10 text-primary"
            )}>
              <User size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-lg uppercase tracking-tighter">Mis Credenciales</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Gestión de llaves maestras personales</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {adminHasCreds && (
               <span className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[9px] font-black uppercase tracking-widest">
                 <CheckCircle2 size={10} />
                 Configurado
               </span>
             )}
             {openSection === "mis-credenciales" ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
          </div>
        </button>
        
        {openSection === "mis-credenciales" && (
          <div className="p-6 pt-0 border-t border-white/5 animate-in slide-in-from-top-2 duration-500">
              <div className="mt-6">
                <TradeCopierKeysForm 
                  hasCredentials={adminHasCreds} 
                  onSuccess={loadData}
                />
              </div>
          </div>
        )}
      </div>

      {/* SECTION 2: TRADERS CREDENTIALS (Compressible Layout) */}
      <div className="flex-1 flex flex-col glass-widget overflow-hidden border-white/5 bg-background/20 rounded-3xl min-h-[500px]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400">
              <Users size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-lg uppercase tracking-tighter text-blue-400">Acceso de Portafolios</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Administre el acceso de los traders registrados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:block text-[9px] font-black text-muted-foreground uppercase bg-white/5 px-3 py-1 rounded-lg tracking-widest">
                {filteredTraders.length} Usuarios
             </div>
          </div>
        </div>

        <div className="flex-1 flex relative overflow-hidden">
          {/* Left Side: List (Compressible) */}
          <div className={cn(
            "h-full p-6 overflow-y-auto no-scrollbar transition-all duration-1000 ease-in-out",
            selectedTrader ? "w-full md:w-[40%] opacity-40 grayscale-[0.5]" : "w-full opacity-100"
          )}>
            {/* Search Bar */}
            <div className="relative max-w-md mb-8">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
               <input 
                type="text" 
                placeholder="BUSCAR POR NOMBRE O EMAIL..." 
                className="w-full bg-background/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-[10px] font-bold tracking-widest uppercase outline-none focus:border-primary/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>

            <div className="grid grid-cols-1 gap-4 transition-all duration-700">
               {loadingTraders ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-24 glass-widget animate-pulse" />
                  ))
               ) : filteredTraders.length > 0 ? (
                  filteredTraders.map((trader) => (
                    <div 
                      key={trader.id} 
                      onClick={() => setSelectedTrader(trader)}
                      className={cn(
                        "p-5 glass-widget widget-hover cursor-pointer group flex items-center justify-between gap-4 transition-all duration-500",
                        selectedTrader?.id === trader.id ? "border-primary bg-primary/10" : "border-white/5"
                      )}
                    >
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black text-white uppercase transition-all duration-500",
                            trader.hasCredentials 
                            ? "bg-gradient-to-br from-emerald-500/80 to-teal-600/80 shadow-lg shadow-emerald-500/20" 
                            : "bg-gradient-to-br from-slate-500 to-slate-700 opacity-60"
                          )}>
                             {trader.name?.charAt(0) || trader.email.charAt(0)}
                          </div>
                          <div className="space-y-0.5">
                             <div className="flex items-center gap-2">
                               <p className="font-black text-xs uppercase tracking-tight">{trader.name || "Usuario Plataforma"}</p>
                               <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded font-black text-muted-foreground uppercase">{trader.role}</span>
                             </div>
                             <p className="text-[9px] font-mono text-muted-foreground opacity-60 truncate max-w-[150px]">{trader.email}</p>
                             <div className="mt-1 flex items-center gap-2">
                                {trader.hasCredentials ? (
                                  <span className="flex items-center gap-1 text-[8px] text-emerald-400 font-black uppercase tracking-widest">
                                    <ShieldCheck size={10} /> Configurado
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[8px] text-amber-500 font-black uppercase tracking-widest">
                                    <Circle size={10} /> Pendiente
                                  </span>
                                )}
                             </div>
                          </div>
                       </div>
                       
                       <div className="p-2 rounded-xl bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300">
                         <Settings2 size={18} className="opacity-50 group-hover:opacity-100" />
                       </div>
                    </div>
                  ))
               ) : (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground opacity-40">
                     <Search size={40} className="mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest">No se encontraron resultados</p>
                  </div>
               )}
            </div>
          </div>

          {/* Right Side: Detail Panel (Sliding Over / Compressed view) */}
          <div className={cn(
            "absolute inset-y-0 right-0 w-full md:w-[60%] bg-background/95 backdrop-blur-3xl border-l border-white/10 z-20 transition-all duration-1000 ease-in-out transform shadow-2xl flex flex-col",
            selectedTrader ? "translate-x-0" : "translate-x-full"
          )}>
             {selectedTrader && (
               <>
                 <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <UserCheck className="w-5 h-5 text-primary" />
                       </div>
                       <div>
                          <h4 className="font-black text-sm uppercase tracking-tight">{selectedTrader.name || "Configurar Trader"}</h4>
                          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest opacity-60">{selectedTrader.email}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setSelectedTrader(null)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-all"
                    >
                      <X size={20} />
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
                    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-8 duration-1000">
                       <div className="mb-10 text-center space-y-2">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-2">
                             <Key size={10} /> Parámetros de Autenticación
                          </div>
                          <h3 className="text-2xl font-black tracking-tighter uppercase shrink-0">Sincronizador de Ejecución</h3>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                             Establezca las llaves seguras para permitir la sincronización de cuentas master.
                          </p>
                       </div>

                       <TradeCopierKeysForm 
                        targetUserId={selectedTrader.id} 
                        hasCredentials={selectedTrader.hasCredentials}
                        onSuccess={() => {
                          loadData();
                          setSelectedTrader(null);
                        }}
                       />
                       
                       <div className="mt-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300">
                          <Activity className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-[9px] font-bold text-amber-500/80 leading-relaxed uppercase tracking-wide">
                             Nota: Al actualizar estas credenciales, se reiniciará la sesión en el entorno de ejecución seguro. Valide la integridad de los datos.
                          </p>
                       </div>
                    </div>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
