import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface WinstreakCardProps {
  current: number;
  best: number;
  losses: number;
  wonDays: number;
  lostTrades: number;
}

export const WinstreakCard = ({
  current,
  best,
  losses,
  wonDays,
  lostTrades,
}: WinstreakCardProps) => {
  return (
    <div className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Winstreak
</h3>
        <div className="text-right">
          <div className="text-sm font-bold text-foreground leading-none">
            {wonDays}
          </div>
          <div className="text-[10px] text-muted-foreground">Days</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-4xl md:text-5xl font-bold text-primary leading-none">
          {current}
</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-sm font-bold text-foreground">{best}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-muted-foreground">{losses}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground">Trades Lost</span>
        <span className="text-xs font-bold text-foreground">{lostTrades}</span>
      </div>
    </div>
  );
};
