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
          <button className="text-gray-400 hover:text-white transition p-1">
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
          <button className="text-gray-400 hover:text-white transition p-1">
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
            <span className="text-blue-400 font-medium">Trades</span>
            <span className="text-white font-bold">479</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-medium">Wins</span>
            <span className="text-white font-bold">368</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-medium">Profits</span>
            <span className="text-white font-bold">4598.14</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-medium">Percent</span>
            <span className="text-white font-bold">113.62%</span>
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
                  className="text-center text-xs font-semibold text-gray-500 py-2"
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
                                  ? "bg-blue-500/20 text-blue-400"
                                  : day.loss
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {day.trades}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-xs md:text-sm font-bold ${
                            day.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          ${Math.abs(day.pnl).toFixed(2)}
                        </div>
                        <div className="text-[10px] md:text-xs text-gray-400">
                          {day.percent && day.percent > 0 ? "+" : ""}
                          {day.percent}%
                        </div>
                      </>
                    ) : (
                      <span className="text-xs md:text-sm font-bold text-gray-600">
                        {day.date}
                      </span>
                    )}
                  </div>
                ))}

              {/* Week Total */}
              <div
                className={`glass-widget p-2 md:p-3 min-h-[60px] md:min-h-[80px] flex flex-col justify-center items-center border-2 ${
                  weekTotals[weekIdx]?.isNegative
                    ? "border-red-500/30"
                    : "border-emerald-500/30"
                }`}
              >
                {weekTotals[weekIdx] && (
                  <>
                    <div
                      className={`text-sm md:text-lg font-bold ${
                        weekTotals[weekIdx].isNegative
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      ${weekTotals[weekIdx].total}
                    </div>
                    <div className="text-[10px] md:text-xs text-gray-400">
                      {weekTotals[weekIdx].percent > 0 ? "+" : ""}
                      {weekTotals[weekIdx].percent}%
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Month Total Row */}
          <div className="grid grid-cols-8 gap-1 mt-4 pt-4 border-t border-gray-700">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="text-center text-gray-600 text-xs">
                -
              </div>
            ))}
            <div className="glass-widget p-3 md:p-4 border-2 border-blue-500/40">
              <div className="text-lg md:text-2xl font-bold text-blue-400 text-center">
                ${monthTotal.total}
              </div>
              <div className="text-xs md:text-sm text-gray-400 text-center">
                +{monthTotal.percent}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
