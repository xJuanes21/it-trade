import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface EquityCurveProps {
  data: any[];
}

export const EquityCurve = ({ data }: EquityCurveProps) => {
  return (
    <div
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in"
      style={{ animationDelay: "0.3s" }}
    >
      <h3 className="text-xs md:text-sm font-semibold text-gray-400 mb-3">
        Equity Curve
      </h3>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="equity"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#equityGradient)"
          />
          <Tooltip
            contentStyle={{
              background: "rgba(10, 15, 35, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface PnLDistributionProps {
  data: any[];
}

export const PnLDistribution = ({ data }: PnLDistributionProps) => {
  return (
    <div
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in"
      style={{ animationDelay: "0.4s" }}
    >
      <h3 className="text-xs md:text-sm font-semibold text-gray-400 mb-3">
        Daily P&L Distribution
      </h3>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data}>
          <Bar dataKey="pnl" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Tooltip
            contentStyle={{
              background: "rgba(10, 15, 35, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
