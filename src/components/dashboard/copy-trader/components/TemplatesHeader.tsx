"use client";

import React from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TemplatesHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isTrader: boolean;
  onNewTemplate: () => void;
}

export function TemplatesHeader({
  searchQuery,
  onSearchChange,
  isTrader,
  onNewTemplate,
}: TemplatesHeaderProps) {
  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between bg-black/20 p-8 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-sm">
      <div>
        <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">
          Plantillas
        </h1>
        <p className="text-muted-foreground font-medium italic opacity-70">
          Gestiona tus estrategias y sigue configuraciones institucionales.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar plantillas..."
            className="w-full md:w-[300px] pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary transition-all shadow-inner font-bold"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {isTrader && (
          <Button
            onClick={onNewTemplate}
            className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus className="mr-2 h-5 w-5" /> Nueva Plantilla
          </Button>
        )}
      </div>
    </div>
  );
}
