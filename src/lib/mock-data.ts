export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export function getMockOperationalData(login: string, userName: string) {
  return {
    header: {
      user_name: userName || "Usuario de Prueba",
      last_sync: new Date().toISOString(),
      account_status: "Verified",
    },
    metrics: {
      current_streak: 5,
      best_streak: 10,
      won_days_month: 20,
      total_days_month: 22,
      lost_trades_week: 2,
      activity_percent: 85,
    },
    charts: {
      trade_count: [
        { time: "08:00", count: 12 },
        { time: "12:00", count: 25 },
        { time: "16:00", count: 8 },
      ],
      daily_profit: [
        { day: "Lun", profit: 120 },
        { day: "Mar", profit: -30 },
        { day: "Mie", profit: 210 },
      ],
      top_symbols: [
        { symbol: "EURUSD", trades: 45 },
        { symbol: "GBPUSD", trades: 20 },
      ],
    },
    finance_summary: {
      gains_percent: 15.4,
      net_pnl: 1250.5,
      period_returns: {
        daily: 1.2,
        weekly: 3.5,
        monthly: 15.4,
        annualized: 120.5,
      },
    },
  };
}

export function getMockFinancialData(login: string) {
  return {
    meta: { account_id: login, last_sync: new Date().toISOString() },
    summary: {
      win_streak: { current: 3, best: 8, losses: 2 },
      total_trades: { won: 45, lost: 15 },
      performance: {
        day_win: 150.5,
        day_loss: -50.2,
        avg_win: 45.2,
        avg_loss: -25.5,
        daily_winrate: 75,
        total_winrate: 68,
      },
      risk: {
        max_drawdown: 5.2,
        current_equity: 12250.5,
        current_balance: 10000,
        highest_balance: 12500,
      },
    },
    capital_flows: {
      deposits: 10000,
      withdrawals: 0,
      commissions: -15.5,
      swap: -2.3,
    },
    trade_stats: {
      win_rate: 68,
      profit_factor: 1.8,
      avg_win_loss_ratio: "1.5",
      avg_duration: "2h 15m",
    },
    charts: {
      equity_curve: [
        { date: "2023-10-01", equity: 10000 },
        { date: "2023-10-02", equity: 10150 },
        { date: "2023-10-03", equity: 10400 },
      ],
      daily_pnl_distribution: [
        { date: "2023-10-01", pnl: 150, color: "green" },
        { date: "2023-10-02", pnl: -50, color: "red" },
        { date: "2023-10-03", pnl: 250, color: "green" },
      ],
    },
    calendar: [
      {
        date: new Date().getTime(),
        pnl: 150,
        percent: 1.5,
        trades: 5,
        roi: true,
      },
    ],
  };
}
