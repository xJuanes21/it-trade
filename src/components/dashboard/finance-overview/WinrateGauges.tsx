import React from "react";

export const SemiCircleProgress = ({
  value,
  max,
  label,
  color,
}: {
  value: number;
  max: number;
  label: string;
  color: string;
}) => {
  const percentage = (value / max) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-28 h-14 md:w-32 md:h-16 mb-2">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="rgba(71, 85, 105, 0.3)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="157"
            strokeDashoffset={157 - (157 * percentage) / 100}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <span className="text-xl md:text-2xl font-bold text-white">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
      <p className="text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
};

export const GaugeCard = ({
  value,
  max,
  label,
  color,
  delay = "0s",
}: {
  value: number;
  max: number;
  label: string;
  color: string;
  delay?: string;
}) => {
  return (
    <div
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in flex flex-col justify-center h-full"
      style={{ animationDelay: delay }}
    >
      <SemiCircleProgress value={value} max={max} label={label} color={color} />
    </div>
  );
};
