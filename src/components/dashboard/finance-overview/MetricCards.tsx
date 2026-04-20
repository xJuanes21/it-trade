import React from "react";
import { cn } from "@/lib/utils";

export const ProgressBar = ({
  value,
  max,
  label,
  showValues,
}: {
  value: number;
  max: number;
  label: string;
  showValues?: boolean;
}) => {
  const isNegative = value < 0;
  const percent = Math.min(100, Math.max(0, (Math.abs(value) / max) * 100));

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        {showValues && (
          <span>
             {isNegative ? "-" : ""}{Math.abs(value).toLocaleString()} / {max.toLocaleString()}
          </span>
        )}
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-muted/30">
        <div
          className={cn(
            "transition-all duration-1000 ease-out h-full",
            isNegative 
              ? "bg-gradient-to-r from-red-500/80 to-red-400/80" 
              : "bg-gradient-to-r from-emerald-500/80 to-emerald-400/80"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export const MetricCard = ({
  title,
  value,
  label,
  max,
  delay = "0s",
}: {
  title?: string;
  value: number | string;
  label: string;
  max?: number;
  delay?: string;
}) => {
  return (
    <div
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in flex flex-col justify-center h-full overflow-hidden"
      style={{ animationDelay: delay }}
    >
      {title && (
        <h3 className="text-[10px] md:text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest opacity-70 truncate">{title}</h3>
      )}
      <div className={cn(
        "text-xl md:text-2xl font-black tracking-tight mb-1 truncate whitespace-nowrap",
        typeof value === "number" 
          ? (value >= 0 ? "text-emerald-500" : "text-red-500") 
          : "text-foreground"
      )}>
        {typeof value === "number" 
          ? `${value >= 0 ? "+" : "-"}${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
          : value}
      </div>
      <div className="text-[10px] md:text-xs text-muted-foreground mb-2 truncate">{label}</div>
      {max !== undefined && typeof value === "number" && (
        <ProgressBar value={value} max={max || 1} label="" />
      )}
    </div>
  );
};
