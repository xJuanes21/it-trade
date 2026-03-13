"use client";

import { useState } from "react";
import { timeframeOptions } from "./data";
import { GainsChart } from "./GainsChart";

export function GainsSection() {
  const [selected, setSelected] = useState<typeof timeframeOptions[number]>(timeframeOptions[0]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-foreground">Ganancias</h3>
        <div className="flex flex-wrap gap-2">
          {timeframeOptions.map((option) => (
            <button
              key={option}
              onClick={() => setSelected(option)}
              className={`rounded-lg px-3 py-1 text-sm transition ${
                option === selected
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-secondary text-secondary-foreground border border-transparent hover:border-primary/50"
              }`}
            >
              {option}
            </button>
          ))}
          <button className="rounded-lg bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80">
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
