"use client";

import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-secondary/50 border border-border p-1 rounded-full backdrop-blur-sm">
      <button
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-full transition-all ${
          theme === "light"
            ? "bg-card text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Modo Claro"
      >
        <Sun size={14} />
      </button>

      <button
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-full transition-all ${
          theme === "system"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Sistema"
      >
        <Laptop size={14} />
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-full transition-all ${
          theme === "dark"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Modo Oscuro"
      >
        <Moon size={14} />
      </button>
    </div>
  );
}
