"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

type CandlePoint = {
  open: number;
  close: number;
  high: number;
  low: number;
};

export function TradingChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) chartRef.current.destroy();

    const data: CandlePoint[] = [];
    let base = 111900;
    for (let i = 0; i < 60; i++) {
      const open = base + (Math.random() - 0.5) * 200;
      const close = open + (Math.random() - 0.5) * 300;
      const high = Math.max(open, close) + Math.random() * 100;
      const low = Math.min(open, close) - Math.random() * 100;
      data.push({ open, close, high, low });
      base = close;
    }

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((_, index) => index),
        datasets: [
          {
            label: "Precio",
            data: data.map((item) => item.close),
            borderColor: (ctx) => {
              const index = ctx.dataIndex ?? 0;
              if (index <= 0) return "#10b981";
              const current = data[index];
              const previous = data[index - 1];
              if (!current || !previous) return "#10b981";
              return current.close >= previous.close ? "#10b981" : "#ef4444";
            },
            segment: {
              borderColor: (ctx) => {
                const curr = data[ctx.p1DataIndex] ?? data[data.length - 1];
                const prev = data[ctx.p0DataIndex] ?? curr;
                if (!curr || !prev) return "#10b981";
                return curr.close >= prev.close ? "#10b981" : "#ef4444";
              },
            },
            borderWidth: 2,
            pointRadius: 0,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1a1f3a",
            titleColor: "#fff",
            bodyColor: "#9ca3af",
            borderColor: "#2a3050",
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const item = data[context.dataIndex];
                return [
                  `O: ${item.open.toFixed(2)}`,
                  `H: ${item.high.toFixed(2)}`,
                  `L: ${item.low.toFixed(2)}`,
                  `C: ${item.close.toFixed(2)}`,
                ];
              },
            },
          },
        },
        scales: {
          x: { display: false },
          y: {
            position: "right",
            grid: { color: "#1a1f35" },
            ticks: {
              color: "#6b7280",
              font: { size: 11 },
              callback: (value) => Number(value).toFixed(2),
            },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
