import { StatCard } from "./data";

type Props = {
  stats: StatCard[];
};

const trendColors: Record<"up" | "down", string> = {
  up: "text-emerald-400",
  down: "text-rose-400",
};

export function StatsCardGrid({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-[#2a3050] bg-[#11152a] p-6 text-white shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
            <span>{stat.label}</span>
            <stat.icon size={18} className="text-slate-500" />
          </div>
          <p className="text-3xl font-bold">{stat.value}</p>
          {stat.change && stat.trend ? (
            <p className={`mt-2 flex items-center gap-1 text-sm font-semibold ${trendColors[stat.trend]}`}>
              {stat.change}
            </p>
          ) : null}
          {stat.subtitle ? (
            <p className={`mt-1 text-sm ${stat.warning ? "text-amber-400" : "text-blue-300"}`}>{stat.subtitle}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
