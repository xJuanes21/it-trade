import React from "react";

interface CapitalFlowsProps {
  capitalFlows: {
    deposits: number;
    withdrawals: number;
    commissions: number;
    swap: number;
  };
  delay?: string;
}

export const CapitalFlows = ({
  capitalFlows,
  delay = "0.5s",
}: CapitalFlowsProps) => {
  return (
    <div
      className="glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in"
      style={{ animationDelay: delay }}
    >
      <h3 className="text-xs md:text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
        Capital Flows
      </h3>
      <div className="space-y-3 text-xs md:text-sm text-white">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">
            Deposits / Withdrawals
          </span>
          <span className="font-bold">
            ${capitalFlows.deposits.toFixed(2)} / $
            {capitalFlows.withdrawals.toLocaleString()}
          </span>
        </div>

        <div className="h-px bg-slate-700/50 my-2" />

        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Commissions & Swap</span>
          <span className="font-bold">
            ${capitalFlows.commissions.toFixed(0)} / $
            {capitalFlows.swap.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
