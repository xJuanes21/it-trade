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
  monthTotal: { total: string; percent: string };
}

export const TradingCalendar = ({
  calendarData,
  weekTotals,
  monthTotal,
}: TradingCalendarProps) => {
  return (
    <div className="glass-widget-darker p-4 md:p-6">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <button className="text-muted-foreground hover:text-foreground transition p-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-xl md:text-2xl font-bold">January 2026</h2>
          <button className="text-gray-400 hover:text-foreground transition p-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Trading Summary (Quick view) */}
        <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:gap-6 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-primary font-medium">Trades</span>
            <span className="text-foreground font-bold">479</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-medium">Wins</span>
            <span className="text-foreground font-bold">368</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-500 font-medium">Profits</span>
            <span className="text-foreground font-bold">4598.14</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-500 font-medium">Percent</span>
            <span className="text-foreground font-bold">113.62%</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Total"].map(
              (day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ),
            )}
          </div>

          {/* Calendar Weeks */}
          {[0, 1, 2, 3, 4].map((weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-8 gap-1 mb-1">
              {calendarData
                .slice(weekIdx * 7, (weekIdx + 1) * 7)
                .map((day, idx) => (
                  <div
                    key={idx}
                    className={`calendar-day glass-widget p-2 md:p-3 min-h-[60px] md:min-h-[80px] ${
                      day.month === "prev" ? "opacity-30" : ""
                    }`}
                  >
                    {day.pnl !== null ? (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs md:text-sm font-bold">
                            {day.date}
                          </span>
                          {day.trades > 0 && (
                            <span
                              className={`text-[10px] md:text-xs font-bold px-1 py-0.5 rounded ${
                                day.roi
                                  ? "bg-primary/20 text-primary"
                                  : day.loss
                                    ? "bg-destructive/20 text-destructive"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {day.trades}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-xs md:text-sm font-bold ${
                            day.pnl >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-destructive"
                          }`}
                        >
                          ${Math.abs(day.pnl).toFixed(2)}
                        </div>
                        <div className="text-[10px] md:text-xs text-muted-foreground">
                          {day.percent && day.percent > 0 ? "+" : ""}
                          {day.percent}%
                        </div>
                      </>
                    ) : (
                      <span className="text-xs md:text-sm font-bold text-muted-foreground/30">
                        {day.date}
                      </span>
                    )}
                  </div>
                ))}

              {/* Week Total */}
              <div
                className={`glass-widget p-2 md:p-3 min-h-[60px] md:min-h-[80px] flex flex-col justify-center items-center border-2 ${
                  weekTotals[weekIdx]?.isNegative
                    ? "border-destructive/30"
                    : "border-emerald-500/30"
                }`}
              >
                {weekTotals[weekIdx] && (
                  <>
                    <div
                      className={`text-sm md:text-lg font-bold ${
                        weekTotals[weekIdx].isNegative
                          ? "text-destructive"
                          : "text-emerald-500 dark:text-emerald-400"
                      }`}
                    >
                      ${weekTotals[weekIdx].total}
                    </div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">
                      {weekTotals[weekIdx].percent > 0 ? "+" : ""}
                      {weekTotals[weekIdx].percent}%
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Month Total Row */}
          <div className="grid grid-cols-8 gap-1 mt-4 pt-4 border-t border-border">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="text-center text-muted-foreground/20 text-xs">
                -
              </div>
            ))}
            <div className="glass-widget p-3 md:p-4 border-2 border-primary/40">
              <div className="text-lg md:text-2xl font-bold text-primary text-center">
                ${monthTotal.total}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground text-center">
                +{monthTotal.percent}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
