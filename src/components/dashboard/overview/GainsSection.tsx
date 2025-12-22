"use client";

import { useState } from "react";
import { timeframeOptions } from "./data";
import { GainsChart } from "./GainsChart";

export function GainsSection() {
  const [selected, setSelected] = useState<typeof timeframeOptions[number]>(timeframeOptions[0]);

  return (
    <div className="rounded-2xl border border-[#2a3050] bg-[#11152a] p-6 text-white shadow-xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Ganancias</h3>
        <div className="flex flex-wrap gap-2">
          {timeframeOptions.map((option) => (
            <button
              key={option}
              onClick={() => setSelected(option)}
              className={`rounded-lg px-3 py-1 text-sm transition ${
                option === selected
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "bg-[#0d1121] text-slate-400 border border-transparent hover:border-[#2a3050]"
              }`}
            >
              {option}
            </button>
          ))}
          <button className="rounded-lg bg-[#1b2038] px-3 py-1 text-sm text-white hover:bg-[#262b44]">
            Ver reporte
          </button>
        </div>
      </div>
      <div className="h-64">
        <GainsChart />
      </div>
    </div>
  );
}
