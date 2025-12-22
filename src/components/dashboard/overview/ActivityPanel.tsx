"use client";

import { ChevronDown } from "lucide-react";
import { activityData } from "./data";

export function ActivityPanel() {
  return (
    <div className="rounded-2xl border border-[#2a3050] bg-[#11152a] p-6 text-white shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Actividad</h3>
        <button className="flex items-center gap-2 rounded-lg border border-[#2a3050] bg-[#0d1121] px-3 py-1.5 text-sm text-slate-300 hover:border-[#3a4060]">
          Hoy
          <ChevronDown size={14} />
        </button>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {activityData.map((item, idx) => (
          <div
            key={`${item.coin}-${idx}`}
            className="flex items-center justify-between rounded-xl border border-[#2a3050] bg-[#0a0e1a] p-4 text-sm text-slate-200 transition hover:border-[#3a4060]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white" style={{ backgroundColor: item.color }}>
                {item.coin.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{item.coin}</p>
                <p className={item.action === "Buy" ? "text-xs text-emerald-400" : "text-xs text-rose-400"}>{item.action}</p>
              </div>
            </div>
            <p className={`font-semibold ${item.action === "Buy" ? "text-emerald-300" : "text-rose-300"}`}>${item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
