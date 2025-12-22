"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export function GainsChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) chartRef.current.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: "Ganancias",
            data: [400, 450, 480, 520, 580, 620, 680, 720, 780, 840, 900, 960],
            borderColor: "#3b82f6",
            backgroundColor: gradient,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: "#3b82f6",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
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
              label: (context) => `$${context.parsed.y.toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false },
            ticks: { color: "#6b7280", font: { size: 11 } },
          },
          y: {
            grid: { color: "#1a1f35", drawBorder: false },
            ticks: {
              color: "#6b7280",
              font: { size: 11 },
              callback: (value) => `$${value}`,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
