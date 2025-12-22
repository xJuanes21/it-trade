"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { donutData } from "./data";

export function PerformanceDonut() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: donutData.labels,
        datasets: [
          {
            data: donutData.values,
            backgroundColor: donutData.colors,
            borderWidth: 0,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
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
      },
    });

    return () => chartRef.current?.destroy();
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
