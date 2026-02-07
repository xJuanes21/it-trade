import React from "react";

interface PnLSummaryProps {
  gains: { percent: number; absolute: number };
  netPnL: number;
  delay?: string;
}

export const PnLSummary = ({
  gains,
  netPnL,
  delay = "0.25s",
}: PnLSummaryProps) => {
  return (
    <div
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in"
      style={{ animationDelay: delay }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
            Gain %
          </div>
          <div className="text-xl md:text-2xl font-bold text-emerald-400">
            +{gains.percent}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
            NET P&L
          </div>
          <div className="text-xl md:text-2xl font-bold text-blue-400">
            +${netPnL.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400 font-medium">
        +${gains.absolute.toLocaleString()} Abs
      </div>
    </div>
  );
};
