"use client";

import { balanceData, balanceMeta } from "./data";

export function BalanceCard() {
  return (
    <div className="glass-widget widget-hover p-6 text-foreground">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            Balance total
            <balanceMeta.icon size={14} className="text-muted-foreground/70" />
          </p>
          <p className="text-3xl font-bold text-foreground">{balanceMeta.total}</p>
          <p className="text-xs text-muted-foreground">{balanceMeta.subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">
        {Object.entries(balanceData).map(([key, item]) => (
          <div
            key={key}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${key === "usd" ? "bg-primary" : "bg-emerald-500"}`}
                ></span>
                {item.label}
              </span>
              <span>{item.percent}%</span>
            </div>
            <p className="text-2xl font-semibold">
              ${item.amount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className="flex h-full">
          <div
            className="h-full bg-primary"
            style={{ width: `${balanceData.usd.percent}%` }}
          />
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${balanceData.usdt.percent}%` }}
          />
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>USD {balanceData.usd.percent}%</span>
        <span>USDT {balanceData.usdt.percent}%</span>
      </div>
    </div>
  );
}
