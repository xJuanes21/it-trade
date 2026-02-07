import React from "react";

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
  const winPercent = (value / max) * 100;
  const lossPercent = 100 - winPercent;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{label}</span>
        {showValues && (
          <span>
            {value} / {max}
          </span>
        )}
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-slate-800">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
          style={{ width: `${winPercent}%` }}
        />
        <div
          className="bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
          style={{ width: `${lossPercent}%` }}
        />
      </div>
    </div>
  );
};

interface PerformanceMetricsProps {
  dayWin: number;
  avgWin: number;
}

export const PerformanceMetrics = ({
  dayWin,
  avgWin,
}: PerformanceMetricsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:gap-5">
      <div
        className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="text-2xl md:text-3xl font-bold text-white mb-1">
          {dayWin}
        </div>
        <div className="text-xs text-gray-400 mb-2">Day Win / Day Loss</div>
        <ProgressBar value={dayWin} max={dayWin || 1} label="" />
      </div>
      <div
        className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="text-2xl md:text-3xl font-bold text-white mb-1">
          {avgWin}
        </div>
        <div className="text-xs text-gray-400 mb-2">Avg Win / Avg Loss</div>
        <ProgressBar value={avgWin} max={1} label="" />
      </div>
    </div>
  );
};
