import { OperationalDashboardResponse, FinancialDashboardResponse } from "@/types/dashboard";

/**
 * Adapter to convert Trade Copier reporting data to the project's standard 
 * Dashboard response formats.
 */
export const tradeCopierAdapter = {
  /**
   * Maps a Trade Copier report to OperationalDashboardResponse
   */
  toOperational(report: any, userName: string): OperationalDashboardResponse {
    // Basic mapping with defaults for missing fields
    return {
      header: {
        user_name: userName,
        last_sync: report.last_sync || new Date().toLocaleString("es-ES"),
        account_status: report.state || "ACTIVE",
      },
      meta: {
        account_id: report.account_id,
        currency: report.currency || "USD",
        broker: report.broker || "Unknown",
        server: report.server || "Unknown",
      },
      metrics: {
        current_streak: report.current_streak || 0,
        best_streak: report.best_streak || 0,
        won_days_month: report.won_days || 0,
        total_days_month: report.total_days || 30,
        lost_trades_week: report.lost_trades_week || 0,
        activity_percent: report.activity_rate || report.win_rate || 0,
      },
      charts: {
        trade_count: report.trade_count_history || [],
        daily_profit: report.daily_profit_history || [],
        top_symbols: report.top_symbols || [],
        equity_curve: report.equity_history || [],
      },
      finance_summary: {
        gains_percent: typeof report.performance === 'number' ? report.performance : parseFloat(report.performance || report.roi || "0"),
        net_pnl: typeof report.pnlUSD === 'number' ? report.pnlUSD : parseFloat(report.pnlUSD || report.profit || "0"),
        period_returns: {
          daily: typeof report.pnlUSD === 'number' ? report.pnlUSD : parseFloat(report.pnlUSD || report.profit || "0"),
          weekly: report.weekly_return || 0,
          monthly: report.monthly_return || 0,
          annualized: report.annual_return || 0,
        },
      },
      technical_stats: {
        equity_start: report.equity_start || 0,
        equity_end: report.equity_end || 0,
        hwm: report.hwm || 0,
        deposit_withdrawal: report.deposit_withdrawal || 0,
        pnl_usd: report.pnlUSD || 0,
        pnl_eur: report.pnlEUR || 0,
        performance_percent: report.performance || 0,
      },
    };
  },

  /**
   * Maps a Trade Copier report to FinancialDashboardResponse
   */
  toFinancial(report: any): FinancialDashboardResponse {
    return {
      meta: {
        account_id: report.account_id,
        last_sync: new Date().toISOString(),
        currency: report.currency || "USD",
        broker: report.broker || "Unknown",
        server: report.server || "Unknown",
      },
      technical_stats: {
        equity_start: report.equity_start || 0,
        equity_end: report.equity_end || 0,
        hwm: report.hwm || 0,
        deposit_withdrawal: report.deposit_withdrawal || 0,
        pnl_usd: report.pnlUSD || 0,
        pnl_eur: report.pnlEUR || 0,
        performance_percent: report.performance || 0,
      },
      summary: {
        win_streak: {
          current: report.current_streak || 0,
          best: report.best_streak || 0,
          losses: report.lost_trades || 0,
        },
        total_trades: {
          won: report.won_trades || 0,
          lost: report.lost_trades || 0,
        },
        performance: {
          day_win: typeof report.pnlUSD === 'number' ? report.pnlUSD : parseFloat(report.pnlUSD || report.profit || "0"),
          day_loss: 0,
          avg_win: report.avg_win || 0,
          avg_loss: report.avg_loss || 0,
          daily_winrate: report.daily_winrate || 0,
          total_winrate: typeof report.win_rate === 'number' ? report.win_rate : parseFloat(report.win_rate || "0"),
        },
        risk: {
          max_drawdown: report.drawdown || 0,
          current_equity: report.equity_end || report.equity || 0,
          current_balance: report.balance || 0,
          highest_balance: report.hwm || report.max_balance || 0,
        },
      },
      capital_flows: {
        deposits: report.deposits || 0,
        withdrawals: report.withdrawals || 0,
        commissions: report.commissions || 0,
        swap: report.swap || 0,
      },
      trade_stats: {
        win_rate: report.win_rate || 0,
        profit_factor: report.profit_factor || 0,
        avg_win_loss_ratio: report.avg_win_loss || "1:1",
        avg_duration: report.avg_duration || "0h",
      },
      charts: {
        equity_curve: report.equity_history || [],
        daily_pnl_distribution: report.pnl_history || [],
      },
      calendar: report.calendar || [],
    };
  },

  /**
   * Creates a fallback OperationalDashboardResponse when no reporting data is available
   */
  createEmptyOperational(account: any, userName: string): OperationalDashboardResponse {
    return {
      header: {
        user_name: userName,
        last_sync: "Pendiente",
        account_status: account.status || "ACTIVE",
      },
      meta: {
        account_id: account.account_id,
        currency: "USD",
        broker: account.broker || "Unknown",
        server: account.server || "Unknown",
      },
      metrics: {
        current_streak: 0,
        best_streak: 0,
        won_days_month: 0,
        total_days_month: 0,
        lost_trades_week: 0,
        activity_percent: 0,
      },
      charts: {
        trade_count: [],
        daily_profit: [],
        top_symbols: [],
        equity_curve: [],
      },
      finance_summary: {
        gains_percent: 0,
        net_pnl: 0,
        period_returns: {
          daily: 0,
          weekly: 0,
          monthly: 0,
          annualized: 0,
        },
      },
      technical_stats: {
        equity_start: 0,
        equity_end: 0,
        hwm: 0,
        deposit_withdrawal: 0,
        pnl_usd: 0,
        pnl_eur: 0,
        performance_percent: 0,
      },
    };
  },

  /**
   * Creates a fallback FinancialDashboardResponse when no reporting data is available
   */
  createEmptyFinancial(account: any): FinancialDashboardResponse {
    return {
      meta: {
        account_id: account.account_id,
        last_sync: new Date().toISOString(),
        currency: "USD",
        broker: account.broker || "Unknown",
        server: account.server || "Unknown",
      },
      technical_stats: {
        equity_start: 0,
        equity_end: 0,
        hwm: 0,
        deposit_withdrawal: 0,
        pnl_usd: 0,
        pnl_eur: 0,
        performance_percent: 0,
      },
      summary: {
        win_streak: { current: 0, best: 0, losses: 0 },
        total_trades: { won: 0, lost: 0 },
        performance: {
          day_win: 0,
          day_loss: 0,
          avg_win: 0,
          avg_loss: 0,
          daily_winrate: 0,
          total_winrate: 0,
        },
        risk: {
          max_drawdown: 0,
          current_equity: 0,
          current_balance: 0,
          highest_balance: 0,
        },
      },
      capital_flows: {
        deposits: 0,
        withdrawals: 0,
        commissions: 0,
        swap: 0,
      },
      trade_stats: {
        win_rate: 0,
        profit_factor: 0,
        avg_win_loss_ratio: "1:1",
        avg_duration: "0h",
      },
      charts: {
        equity_curve: [],
        daily_pnl_distribution: [],
      },
      calendar: [],
    };
  }
};
