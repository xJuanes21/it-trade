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
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in flex flex-col justify-center h-full"
      style={{ animationDelay: delay }}
    >
      {title && (
        <h3 className="text-xs font-semibold text-gray-400 mb-2">{title}</h3>
      )}
      <div className="text-2xl md:text-3xl font-bold text-white mb-1">
        {value}
      </div>
      <div className="text-[10px] md:text-xs text-gray-400 mb-2">{label}</div>
      {max !== undefined && typeof value === "number" && (
        <ProgressBar value={value} max={max || 1} label="" />
      )}
    </div>
  );
};
