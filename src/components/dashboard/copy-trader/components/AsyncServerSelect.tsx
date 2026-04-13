"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Loader2, Search } from "lucide-react";
import { useOnClickOutside } from "@/hooks/use-onclick-outside";
import { tradeCopierService } from "@/services/trade-copier.service";

interface ServerOption {
  id: string;
  name: string;
}

interface AsyncServerSelectProps {
  broker: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AsyncServerSelect({
  broker,
  value,
  onChange,
  placeholder = "Buscar servidor...",
  className,
  disabled = false,
}: AsyncServerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<ServerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [selectedLabel, setSelectedLabel] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef as React.RefObject<HTMLElement>, () => setIsOpen(false));

  const fetchServers = useCallback(async (term: string, pageNum: number, append: boolean = false) => {
    if (!broker || !hasMore) return;
    
    setLoading(true);
    try {
      const res = await tradeCopierService.getServersList(broker, term, pageNum);
      let rawServers = [];
      let totalCount = 0;

      if (Array.isArray(res)) {
        rawServers = res;
        totalCount = res.length;
      } else if (res.data && Array.isArray(res.data.servers)) {
        rawServers = res.data.servers;
        totalCount = res.data.totalCount || rawServers.length;
      } else if (Array.isArray(res.data)) {
        rawServers = res.data;
        totalCount = res.totalCount || rawServers.length;
      } else if (Array.isArray(res.payload)) {
        rawServers = res.payload;
        totalCount = res.totalCount || rawServers.length;
      }
      
      const mappedList = rawServers.map((item: any) => ({
        id: item.id || item.name || item.text || item, // Fallback carefully
        name: item.text || item.name || item.id || item
      }));
      
      if (append) {
        setOptions(prev => {
          const combined = [...prev, ...mappedList];
          if (combined.length >= totalCount || mappedList.length === 0) setHasMore(false);
          return combined;
        });
      } else {
        setOptions(mappedList);
        if (mappedList.length >= totalCount || mappedList.length === 0) setHasMore(false);
      }
    } catch (e) {
      console.error("Error al cargar servidores:", e);
    } finally {
      setLoading(false);
    }
  }, [broker, hasMore]);

  // Se eliminó el auto-fetch para evitar el límite de peticiones (Rate Limit 20/hr)
  const handleSearchClick = () => {
    if (!isOpen || disabled || !searchTerm) return;
    setHasMore(true);
    setPage(1);
    fetchServers(searchTerm, 1, false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchClick();
    }
  };

  // Set initial selectedLabel if value is provided from external but no options are mapped yet
  useEffect(() => {
    if (value && options.length > 0) {
      const found = options.find(o => o.id === value);
      if (found) setSelectedLabel(found.name);
    } else if (!value) {
      setSelectedLabel("");
    }
  }, [value, options]);

  const handleSelect = (option: ServerOption) => {
    setSelectedLabel(option.name);
    onChange(option.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 20 && !loading && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchServers(searchTerm, nextPage, true);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className, disabled && "opacity-50 cursor-not-allowed")}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-border bg-background/50 px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20",
          isOpen && "border-primary/50 ring-2 ring-primary/20"
        )}
      >
        <span className={cn("truncate font-medium text-foreground", !selectedLabel && "text-muted-foreground")}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full flex flex-col rounded-xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top">
          {/* Search Input Box */}
          <div className="flex items-center gap-2 p-3 border-b border-white/10">
            <input
               type="text"
               className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
               placeholder="Escriba el broker y toque la lupa..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               onKeyDown={handleKeyDown}
               autoFocus
            />
            <button 
              type="button" 
              onClick={handleSearchClick}
              disabled={loading || !searchTerm}
              className="p-1.5 rounded-md bg-primary/20 text-primary hover:bg-primary/40 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 shrink-0" />}
            </button>
          </div>
          
          <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-[10px] text-yellow-500/90 font-medium leading-tight">
            Para evitar bloqueos por límite de peticiones, use una palabra específica y presione la lupa para buscar.
          </div>
          
          <div 
            ref={listRef} 
            onScroll={handleScroll} 
            className="max-h-60 overflow-y-auto p-1"
          >
            {options.length === 0 && !loading ? (
              <div className="px-4 py-4 text-sm text-center text-muted-foreground">No se encontraron resultados</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-colors hover:bg-primary/10",
                    option.id === value ? "bg-primary/20 text-primary font-bold" : "text-foreground"
                  )}
                >
                  <span className="truncate">{option.name}</span>
                  {option.id === value && <Check className="h-4 w-4" />}
                </button>
              ))
            )}
            {loading && (
              <div className="flex items-center justify-center p-3 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
