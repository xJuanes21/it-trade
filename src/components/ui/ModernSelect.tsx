"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";
import { useOnClickOutside } from "@/hooks/use-onclick-outside";

interface Option {
  value: string | number;
  label: string;
}

interface ModernSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ModernSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  className,
  disabled = false,
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useOnClickOutside(containerRef as React.RefObject<HTMLElement>, () => setIsOpen(false));

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
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
        <span className={cn("truncate font-medium text-foreground", !selectedOption && "text-muted-foreground")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-border bg-popover/95 p-1 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-xs text-muted-foreground">No hay opciones</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-colors hover:bg-primary/10",
                  option.value === value ? "bg-primary/20 text-primary font-bold" : "text-foreground"
                )}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && <Check className="h-4 w-4" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
