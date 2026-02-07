import React from "react";

interface RiskCardProps {
  risk: {
    maxDrawdown: number;
    currentEquity: number;
    currentBalance: number;
    highestBalance: number;
  };
  delay?: string;
}

export const RiskCard = ({ risk, delay = "0.45s" }: RiskCardProps) => {
  return (
    <div
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in"
      style={{ animationDelay: delay }}
    >
      <h3 className="text-xs md:text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
        Risk
      </h3>
      <div className="space-y-3 text-xs md:text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Max Drawdown</span>
          <span className="text-red-400 font-bold">{risk.maxDrawdown}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Current Equity</span>
          <span className="text-white font-bold">
            ${risk.currentEquity.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Current Balance</span>
          <span className="text-white font-bold">
            ${risk.currentBalance.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Highest Balance</span>
          <span className="text-white font-bold">
            ${risk.highestBalance.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
