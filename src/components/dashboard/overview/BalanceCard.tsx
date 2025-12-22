"use client";

import { balanceData, balanceMeta } from "./data";

export function BalanceCard() {
  return (
    <div className="rounded-2xl border border-[#2a3050] bg-[#11152a] p-6 text-white shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-1 flex items-center gap-2 text-sm text-slate-400">
            Balance total
            <balanceMeta.icon size={14} className="text-slate-500" />
          </p>
          <p className="text-3xl font-bold">{balanceMeta.total}</p>
          <p className="text-xs text-slate-500">{balanceMeta.subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">
        {Object.entries(balanceData).map(([key, item]) => (
          <div key={key} className="rounded-2xl border border-[#2a3050] bg-[#0a0e1a] p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${key === "usd" ? "bg-blue-500" : "bg-emerald-500"}`}
                ></span>
                {item.label}
              </span>
              <span>{item.percent}%</span>
            </div>
            <p className="text-2xl font-semibold">${item.amount.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#0a0e1a]">
        <div className="flex h-full">
          <div className="h-full bg-blue-500" style={{ width: `${balanceData.usd.percent}%` }} />
          <div className="h-full bg-emerald-500" style={{ width: `${balanceData.usdt.percent}%` }} />
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>USD {balanceData.usd.percent}%</span>
        <span>USDT {balanceData.usdt.percent}%</span>
      </div>
    </div>
  );
}
