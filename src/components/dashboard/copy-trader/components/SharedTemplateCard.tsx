"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User as UserIcon, ArrowRight, Copy, Play, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface SharedTemplateCardProps {
  template: any;
  hasSlave: boolean;
  isTrader: boolean;
  onClone: (template: any) => void;
  onFollow: (template: any) => void;
}

export function SharedTemplateCard({
  template: t,
  hasSlave,
  isTrader,
  onClone,
  onFollow,
}: SharedTemplateCardProps) {
  return (
    <div className="relative group h-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-primary/20 to-purple-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
      <Card className="relative bg-black/40 border-white/5 rounded-[2.5rem] backdrop-blur-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:translate-y-[-8px] h-full flex flex-col">
        <CardContent className="p-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-8 text-foreground">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center border border-white/10 text-sm font-black text-primary shadow-inner uppercase">
                {t.user?.name?.charAt(0) || "T"}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-primary tracking-widest line-clamp-1">
                  {t.user?.name || "Trader"}
                </p>
                <h4 className="text-xl font-black text-foreground line-clamp-1">
                  {t.name}
                </h4>
              </div>
            </div>

            <div className="flex gap-2">
              {/* CLONE BUTTON (Traders only) */}
              {isTrader && (
                <Button
                  variant="ghost"
                  onClick={() => onClone(t)}
                  className="rounded-2xl h-11 w-11 p-0 bg-white/5 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all shadow-xl active:scale-95 shrink-0"
                >
                  <Copy size={16} />
                </Button>
              )}

              {/* FOLLOW BUTTON (Investors/Everyone with Slave) */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <Button
                        variant={t.isFollowedByMe ? "outline" : "default"}
                        disabled={!hasSlave || t.isFollowedByMe}
                        onClick={() => onFollow(t)}
                        className={cn(
                          "rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:grayscale",
                          t.isFollowedByMe 
                            ? "border-primary/50 text-primary bg-primary/5 cursor-default opacity-100" 
                            : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-30"
                        )}
                      >
                        {t.isFollowedByMe ? (
                          <>
                            <Shield size={16} className="mr-2" />
                            Siguiendo
                          </>
                        ) : (
                          <>
                            <Play size={16} className="mr-2 fill-current" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!hasSlave && (
                    <TooltipContent className="bg-amber-500 text-black font-bold border-none rounded-xl p-3">
                      <p>Requiere cuenta ESCLAVA activa</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3 mb-8 italic leading-loose opacity-70 group-hover:opacity-100 transition-opacity min-h-[4rem]">
            "
            {t.description ||
              "Plantilla de trading algorítmico sin descripción. Revisar parámetros técnicos antes de operar."}
            "
          </p>

          <div className="mt-auto flex items-center justify-between text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em] pt-8 border-t border-white/5">
            <div className="flex items-center gap-2">
              <ArrowRight size={12} className="text-primary" />
              <span className="text-foreground truncate max-w-[120px]">
                {t.modelConfig?.name || "Reglas Dinámicas"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon
                size={12}
                className={t.isExternalOnly ? "text-primary" : "text-blue-400"}
              />
              <span
                className={
                  t.isExternalOnly
                    ? "text-primary font-black"
                    : "text-foreground"
                }
              >
                {t.isExternalOnly ? "VERIFIED" : "GLOBAL"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
