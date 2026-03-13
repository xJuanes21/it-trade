import { StatCard } from "./data";

type Props = {
  stats: StatCard[];
};

const trendColors: Record<"up" | "down", string> = {
  up: "text-emerald-600 dark:text-emerald-400",
  down: "text-destructive",
};

export function StatsCardGrid({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>{stat.label}</span>
            <stat.icon size={18} className="text-muted-foreground/70" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          {stat.change && stat.trend ? (
            <p className={`mt-2 flex items-center gap-1 text-sm font-semibold ${trendColors[stat.trend]}`}>
              {stat.change}
            </p>
          ) : null}
          {stat.subtitle ? (
            <p className={`mt-1 text-sm ${stat.warning ? "text-yellow-600 dark:text-amber-400" : "text-primary"}`}>{stat.subtitle}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
