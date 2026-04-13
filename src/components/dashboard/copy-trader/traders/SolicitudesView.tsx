"use client";

import React, { useState, useEffect } from "react";
import { tradeCopierService } from "@/services/trade-copier.service";
import { toast } from "sonner";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  User, 
  Activity, 
  Clock,
  Check,
  X,
  ShieldCheck,
  Settings,
  MoreVertical,
  AlertCircle,
  ArrowRight,
  UserCheck,
  UserX,
  ExternalLink
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyRequest {
  id: string;
  followerId: string;
  traderId: string;
  masterAccountId: string;
  slaveAccountId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  msg?: string;
  createdAt: string;
  slaveAccount?: {
    name: string;
    broker: string;
    login: string;
    server: string;
  };
  follower: {
    name: string | null;
    email: string;
    profile?: {
      firstName: string | null;
      lastName: string | null;
    }
  };
}

export default function SolicitudesView() {
  const [requests, setRequests] = useState<CopyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<CopyRequest | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await tradeCopierService.getCopyRequests();
      if (res.status === "success") {
        setRequests(res.data);
      }
    } catch (error) {
      toast.error("Error al cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId: string, status: "APPROVED" | "REJECTED") => {
    setProcessingId(requestId);
    try {
      const res = await tradeCopierService.updateCopyRequestStatus(requestId, status);
      if (res.status === "success") {
        toast.success(status === "APPROVED" ? "Solicitud aprobada con éxito" : "Solicitud rechazada");
        setSelectedRequest(null);
        fetchRequests();
      } else {
        toast.error(res.message || "Error al procesar la solicitud");
      }
    } catch (error: any) {
      toast.error(error.message || "Error de conexión");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-medium uppercase tracking-widest">Sincronizando Solicitudes...</p>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === "PENDING");
  const historyRequests = requests.filter(r => r.status !== "PENDING");

  return (
    <div className="relative flex flex-col lg:flex-row gap-8 min-h-[600px] overflow-hidden">
      {/* List section */}
      <div className={cn(
        "flex-1 space-y-10 animate-in fade-in duration-700 transition-all duration-700",
        selectedRequest ? "lg:pr-4" : ""
      )}>
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Clock size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Solicitudes Pendientes</h2>
            <span className="bg-amber-500/20 text-amber-500 text-[10px] font-black px-2 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <Card className="border-dashed border-white/5 bg-white/[0.02] py-12">
              <CardContent className="flex flex-col items-center justify-center text-center gap-3">
                <ShieldCheck size={40} className="text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground font-medium">No tienes solicitudes pendientes por el momento.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingRequests.map((req) => (
                <RequestCard 
                  key={req.id} 
                  request={req} 
                  onClick={() => setSelectedRequest(req)}
                  isSelected={selectedRequest?.id === req.id}
                />
              ))}
            </div>
          )}
        </section>

        {historyRequests.length > 0 && (
          <section className="space-y-4 opacity-80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-xl text-muted-foreground">
                <Activity size={20} />
              </div>
              <h2 className="text-sm font-bold tracking-tight text-muted-foreground">Historial de Decisiones</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {historyRequests.map((req) => (
                <RequestCard 
                    key={req.id} 
                    request={req} 
                    isHistory 
                    onClick={() => setSelectedRequest(req)}
                    isSelected={selectedRequest?.id === req.id}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Side Panel (Animation similar to Traders module) */}
      <RequestDetailPanel 
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onAction={handleAction}
        isProcessing={!!processingId}
      />
    </div>
  );
}

function RequestCard({ 
  request, 
  onClick,
  isSelected,
  isHistory = false 
}: { 
  request: CopyRequest; 
  onClick: () => void;
  isSelected?: boolean;
  isHistory?: boolean;
}) {
  const followerName = request.follower.profile 
    ? `${request.follower.profile.firstName} ${request.follower.profile.lastName}`
    : (request.follower.name || request.follower.email);

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "glass-widget-darker widget-hover group overflow-hidden border-white/5 shadow-xl cursor-pointer transition-all duration-300",
        isSelected ? "border-primary/40 bg-primary/[0.03] ring-1 ring-primary/20" : ""
      )}
    >
      <CardContent className="p-0">
        <div className="p-5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-primary/10 text-primary border-primary/20"
            )}>
               <User size={22} className={cn(isSelected ? "opacity-100" : "opacity-80")} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-extrabold text-sm text-foreground tracking-tight uppercase">
                  {followerName}
                </h3>
                {isHistory && (
                  <span className={cn(
                    "text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest",
                    request.status === "APPROVED" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-100"
                  )}>
                    {request.status === "APPROVED" ? "Aprobada" : "Rechazada"}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
                {request.follower.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2">
                Ver Detalles <ArrowRight size={12} />
             </div>
             <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                <MoreVertical size={14} className="text-muted-foreground" />
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestDetailPanel({ 
  request, 
  isOpen, 
  onClose, 
  onAction,
  isProcessing 
}: { 
  request: CopyRequest | null; 
  isOpen: boolean; 
  onClose: () => void; 
  onAction: (id: string, status: "APPROVED" | "REJECTED") => void;
  isProcessing: boolean;
}) {
  // We keep the component mounted but use transition for the width
  const followerName = request?.follower.profile 
    ? `${request.follower.profile.firstName} ${request.follower.profile.lastName}`
    : (request?.follower.name || request?.follower.email || "Usuario");

  return (
    <div 
      className={cn(
        "absolute right-0 top-0 bottom-0 lg:static transition-all duration-1000 ease-in-out bg-background/98 backdrop-blur-3xl border border-border lg:rounded-3xl flex flex-col z-20 overflow-hidden shrink-0",
        isOpen ? "w-full lg:w-[50%] translate-x-0 opacity-100" : "w-0 translate-x-full lg:translate-x-0 opacity-0 pointer-events-none"
      )}
    >
      {request && (
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="p-5 border-b border-border flex items-center justify-between bg-card/10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg font-black text-foreground tracking-tight uppercase leading-none">Detalle de Solicitud</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-primary/80">Gestión de Socios</span>
                  <div className="w-0.5 h-0.5 rounded-full bg-border" />
                  <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">ID: {request.id.slice(-8)}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* User Profile */}
            <section className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Información del Solicitante</p>
              <div className="p-6 rounded-3xl glass-widget-darker border-white/5 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black border border-primary/10">
                  {followerName.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tighter uppercase">{followerName}</h3>
                  <p className="text-[10px] font-black tracking-[0.1em] text-primary uppercase">{request.follower.email}</p>
                </div>
              </div>
            </section>

            {/* Account Details Block */}
            <section className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Configuración de Vinculación</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-5 rounded-2xl glass-widget border-white/5 space-y-3 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      <ShieldCheck size={40} />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ArrowRight size={10} className="text-primary" /> Estrategia Master Destino
                      </p>
                      <p className="text-sm font-mono font-bold tracking-tight text-foreground">{request.masterAccountId}</p>
                   </div>
                   <div className="h-px w-full bg-border/50" />
                   <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Activity size={10} className="text-emerald-400" /> Cuenta Slave Solicitada
                      </p>
                      {request.slaveAccount ? (
                        <div className="flex items-center gap-4 p-4 mt-2 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                           <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10 shadow-inner">
                              <ShieldCheck size={24} />
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-sm font-black text-foreground tracking-tight uppercase">{request.slaveAccount.name}</p>
                              <div className="flex items-center gap-3">
                                 <div className="flex items-center gap-1.5">
                                    <Activity size={10} className="text-muted-foreground" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{request.slaveAccount.broker}</span>
                                 </div>
                                 <div className="w-1 h-1 rounded-full bg-border" />
                                 <span className="text-[10px] font-mono font-bold text-emerald-400">#{request.slaveAccount.login}</span>
                              </div>
                           </div>
                        </div>
                      ) : (
                        <p className="text-sm font-mono font-bold tracking-tight text-emerald-400">#{request.slaveAccountId}</p>
                      )}
                   </div>
                </div>
              </div>
            </section>

            {/* Audit Resumen */}
            <section className="space-y-4">
               <div className="glass-widget overflow-hidden">
                  <div className="px-5 py-3 border-b border-border flex justify-between items-center bg-muted/30">
                     <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Log de Registro</p>
                     <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                        request.status === "PENDING" ? "bg-amber-500/10 text-amber-500" : "bg-white/5 text-muted-foreground"
                     )}>
                        {request.status}
                     </span>
                  </div>
                  <div className="divide-y divide-border">
                     <div className="px-5 py-3 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Fecha de Creación</span>
                        <span className="text-[10px] font-mono font-bold">{new Date(request.createdAt).toLocaleDateString()}</span>
                     </div>
                     <div className="px-5 py-3 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Hora exact</span>
                        <span className="text-[10px] font-mono font-bold">{new Date(request.createdAt).toLocaleTimeString()}</span>
                     </div>
                  </div>
               </div>
            </section>
          </div>

          {/* Action Footer */}
          {request.status === "PENDING" && (
            <div className="p-6 mt-auto border-t border-border bg-card/10 space-y-3">
              <Button 
                onClick={() => onAction(request.id, "APPROVED")}
                disabled={isProcessing}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Aprobar Asociación</>}
              </Button>
              <Button 
                variant="ghost"
                onClick={() => onAction(request.id, "REJECTED")}
                disabled={isProcessing}
                className="w-full h-12 rounded-2xl text-red-500 hover:bg-red-500/10 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <><X size={16} /> Rechazar y Archivar</>}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
