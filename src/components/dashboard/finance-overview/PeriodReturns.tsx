import React from "react";

interface PeriodReturnsProps {
  periodReturns: {
    daily: number;
    weekly: number;
    monthly: number;
    annualized: number;
  };
  delay?: string;
}

export const PeriodReturns = ({
  periodReturns,
  delay = "0.35s",
}: PeriodReturnsProps) => {
  return (
    <div
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in h-full"
      style={{ animationDelay: delay }}
    >
      <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
        Period Returns
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/50 rounded-lg p-3 border border-border">
          <div className="text-[10px] text-muted-foreground uppercase font-medium">
            Daily
          </div>
          <div className="text-lg md:text-xl font-bold text-emerald-500 dark:text-emerald-400">
            +{periodReturns.daily}%
          </div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 border border-border">
          <div className="text-[10px] text-muted-foreground uppercase font-medium">
            Weekly
          </div>
          <div className="text-lg md:text-xl font-bold text-emerald-500 dark:text-emerald-400">
            +{periodReturns.weekly}%
          </div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 border border-border">
          <div className="text-[10px] text-muted-foreground uppercase font-medium">
            Monthly
          </div>
          <div className="text-lg md:text-xl font-bold text-emerald-500 dark:text-emerald-400">
            +{periodReturns.monthly}%
          </div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 border border-border">
          <div className="text-[10px] text-muted-foreground uppercase font-medium">
            Annualized
          </div>
          <div className="text-lg md:text-xl font-bold text-emerald-500 dark:text-emerald-400">
            +{periodReturns.annualized}%
          </div>
        </div>
      </div>
    </div>
  );
};
