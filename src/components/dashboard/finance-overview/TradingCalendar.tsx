import React from "react";

interface CalendarDay {
  date: number;
  month?: string;
  pnl: number | null;
  percent?: number;
  trades: number;
  roi?: boolean;
  loss?: boolean;
}

interface TradingCalendarProps {
  calendarData: CalendarDay[];
  weekTotals: any[];
  monthTotal: { total: string; percent: string; trades?: number; wins?: number };
  monthName?: string;
  year?: number;
}

export const TradingCalendar = ({
  calendarData,
  weekTotals,
  monthTotal,
  monthName = "Marzo",
  year = 2026,
}: TradingCalendarProps) => {
  return (
    <div className="glass-widget-darker p-4 md:p-6 shadow-xl">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <button className="text-muted-foreground hover:text-foreground transition p-2 bg-white/5 rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">{monthName} {year}</h2>
          <button className="text-gray-400 hover:text-foreground transition p-2 bg-white/5 rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Trading Summary (Quick view) */}
        <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:gap-6 text-xs md:text-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
            <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Trades</span>
            <span className="text-foreground font-bold text-base">{monthTotal.trades || 0}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 border-l border-white/10 pl-3 md:pl-0 md:border-none">
            <span className="text-emerald-500 font-medium uppercase tracking-wider text-[10px]">Wins</span>
            <span className="text-foreground font-bold text-base">{monthTotal.wins || 0}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
            <span className="text-cyan-400 font-medium uppercase tracking-wider text-[10px]">Profits</span>
            <span className="text-foreground font-bold text-base">${monthTotal.total}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 border-l border-white/10 pl-3 md:pl-0 md:border-none">
            <span className="text-primary font-medium uppercase tracking-wider text-[10px]">Return</span>
            <span className="text-foreground font-bold text-base">{monthTotal.percent}%</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-[700px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 gap-2 mb-3">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Semana"].map(
              (day) => (
                <div
                  key={day}
                  className="text-center text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 py-2"
                >
                  {day}
                </div>
              ),
            )}
          </div>

          {/* Calendar Weeks */}
          {[0, 1, 2, 3, 4, 5].map((weekIdx) => {
            const weekDays = calendarData.slice(weekIdx * 7, (weekIdx + 1) * 7);
            if (weekDays.length === 0) return null;

            return (
              <div key={weekIdx} className="grid grid-cols-8 gap-2 mb-2">
                {weekDays.map((day, idx) => (
                  <div
                    key={idx}
                    className={`calendar-day glass-widget p-2 md:p-3 min-h-[70px] md:min-h-[90px] transition-all hover:bg-white/5 border border-white/5 rounded-xl ${
                      day.month === "prev" || day.month === "next" ? "opacity-20 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted-foreground/80">
                        {day.date}
                      </span>
                      {day.trades > 0 && day.pnl !== null && (
                        <div className={`w-1.5 h-1.5 rounded-full ${day.pnl >= 0 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`}></div>
                      )}
                    </div>
                    {day.pnl !== null ? (
                      <div className="space-y-0.5">
                        <div
                          className={`text-xs md:text-sm font-bold ${
                            day.pnl >= 0 ? "text-emerald-400" : "text-destructive"
                          }`}
                        >
                          {day.pnl >= 0 ? "+" : "-"}${Math.abs(day.pnl).toFixed(2)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-muted-foreground/60">{day.trades} trades</span>
                          <span className={`text-[9px] font-medium ${day.percent && day.percent >= 0 ? "text-emerald-500/70" : "text-destructive/70"}`}>
                            {day.percent && day.percent > 0 ? "+" : ""}{day.percent}%
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}

                {/* Week Total */}
                <div
                  className={`glass-widget p-2 md:p-3 min-h-[70px] md:min-h-[90px] flex flex-col justify-center items-center border-[1.5px] rounded-xl bg-primary/5 transition-transform hover:scale-[1.02] ${
                    weekTotals[weekIdx]?.isNegative
                      ? "border-destructive/20"
                      : "border-primary/20"
                  }`}
                >
                  {weekTotals[weekIdx] && (
                    <>
                      <div
                        className={`text-xs md:text-base font-bold text-center leading-tight ${
                          weekTotals[weekIdx].isNegative
                            ? "text-destructive"
                            : "text-primary"
                        }`}
                      >
                        {weekTotals[weekIdx].total >= 0 ? "+" : "-"}${Math.abs(weekTotals[weekIdx].total).toFixed(2)}
                      </div>
                      <div className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-tighter mt-1">
                        {weekTotals[weekIdx].percent > 0 ? "+" : ""}
                        {weekTotals[weekIdx].percent}%
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Month Total Row */}
          <div className="grid grid-cols-8 gap-2 mt-6 pt-6 border-t border-white/10">
            <div className="col-span-7 flex items-center justify-end pr-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Total Mensual
            </div>
            <div className="glass-widget-darker p-3 md:p-4 border border-primary/30 rounded-2xl bg-primary/10 group overflow-hidden relative">
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="text-base md:text-xl font-bold text-primary text-center leading-none">
                  ${monthTotal.total}
                </div>
                <div className="text-[10px] md:text-xs font-bold text-primary/70 text-center mt-1">
                  +{monthTotal.percent}% {monthName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
