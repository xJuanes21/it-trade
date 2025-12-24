"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { areaSeries } from "./data";

export function AreaChartWidget() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) chartRef.current.destroy();

    const gradients = areaSeries.map((series) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, `${series.color}66`);
      gradient.addColorStop(1, `${series.color}00`);
      return gradient;
    });

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: areaSeries.map((series, idx) => ({
          label: series.label,
          data: series.values,
          borderColor: series.color,
          backgroundColor: gradients[idx],
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        })),
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
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#6b7280", font: { size: 11 } },
          },
          y: {
            grid: { color: "#1a1f35" },
            ticks: { color: "#6b7280", font: { size: 11 } },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
