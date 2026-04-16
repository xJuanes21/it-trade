import { OperationalDashboardResponse, FinancialDashboardResponse } from "@/types/dashboard";

/**
 * Adapter to convert Trade Copier reporting data to the project's standard 
 * Dashboard response formats.
 * 
 * IMPORTANT: This adapter only maps fields that ACTUALLY exist in the API responses.
 * Fields that don't come from the API are either computed from closedPositions or omitted.
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
   * 
   * ONLY maps fields that actually come from the reporting API:
   * - equity_start, equity_end, hwm, deposit_withdrawal
   * - pnlUSD, pnlEUR, pnlCcy, performance
   * - currency, broker, day_from, day_to
   * 
   * Fields NOT in the reporting API (win_rate, profit_factor, deposits, withdrawals, etc.)
   * are left at defaults and should be computed via computeTradeStatsFromHistory()
   */
  toFinancial(report: any): FinancialDashboardResponse {
    const pnlUSD = typeof report.pnlUSD === 'number' ? report.pnlUSD : parseFloat(report.pnlUSD || "0");
    const pnlEUR = typeof report.pnlEUR === 'number' ? report.pnlEUR : parseFloat(report.pnlEUR || "0");
    const performance = typeof report.performance === 'number' ? report.performance : parseFloat(report.performance || "0");

    return {
      meta: {
        account_id: report.account_id,
        last_sync: new Date().toISOString(),
        currency: report.currency || "USD",
        broker: report.broker || "Unknown",
        server: report.server || "Unknown",
        day_from: "N/A",
        day_to: "N/A",
      },
      account_info: {
        balance: 0,
        equity: 0,
        free_margin: 0,
        open_trades: 0,
        state: "UNKNOWN",
        broker: report.broker || "Unknown",
        name: report.name || "Account",
        ccyToUSD: 1,
        ccyToEUR: 1,
        environment: "N/A",
        login: "N/A",
        subscription_name: "N/A",
        expiration: "N/A",
      },
      technical_stats: {
        equity_start: report.equity_start || 0,
        equity_end: report.equity_end || 0,
        hwm: report.hwm || 0,
        deposit_withdrawal: report.deposit_withdrawal || 0,
        pnl_usd: pnlUSD,
        pnl_eur: pnlEUR,
        performance_percent: performance,
      },
      summary: {
        total_trades: { won: 0, lost: 0, total: 0 },
        performance: {
          pnl: pnlUSD,
          performance_percent: performance,
        },
        risk: {
          current_equity: report.equity_end || 0,
          current_balance: 0,
          highest_balance: report.hwm || 0,
        },
      },
      capital_flows: {
        deposit_withdrawal: report.deposit_withdrawal || 0,
      },
      trade_stats: {
        win_rate: 0,
        profit_factor: 0,
        avg_win: 0,
        avg_loss: 0,
        avg_win_loss_ratio: "N/A",
        avg_duration: "N/A",
        total_trades: 0,
        won_trades: 0,
        lost_trades: 0,
      },
      charts: {
        equity_curve: [],
        daily_pnl_distribution: [],
      },
      calendar: [],
    };
  },

  /**
   * Aggregates multiple accounts and their reports into a single global portfolio view
   */
  aggregatePortfolio(accounts: any[], reports: any[], closedPositions: any[], dayFrom: string, dayTo: string): FinancialDashboardResponse {
    // 1. Aggregate Real-time Account Data
    const totalBalance = accounts.reduce((acc, curr) => acc + (parseFloat(curr.balance) || 0), 0);
    const totalEquity = accounts.reduce((acc, curr) => acc + (parseFloat(curr.equity) || 0), 0);
    const totalFreeMargin = accounts.reduce((acc, curr) => acc + (parseFloat(curr.free_margin) || 0), 0);
    const totalOpenTrades = accounts.reduce((acc, curr) => acc + (parseInt(curr.open_trades) || 0), 0);
    const anyConnected = accounts.some(a => a.state === "CONNECTED");

    // 2. Aggregate Reporting Data
    const startEquity = reports.reduce((acc, curr) => acc + (parseFloat(curr.equity_start) || 0), 0);
    const totalEquityEndFromReports = reports.reduce((acc, curr) => acc + (parseFloat(curr.equity_end) || 0), 0);
    const hwmTotal = reports.reduce((acc, curr) => acc + (parseFloat(curr.hwm) || 0), 0);
    const depositWithdrawal = reports.reduce((acc, curr) => acc + (parseFloat(curr.deposit_withdrawal) || 0), 0);
    const pnlUsd = reports.reduce((acc, curr) => acc + (parseFloat(curr.pnlUSD || curr.pnlCcy) || 0), 0);
    const pnlEur = reports.reduce((acc, curr) => acc + (parseFloat(curr.pnlEUR) || 0), 0);
    const performance = startEquity > 0 ? (pnlUsd / startEquity) * 100 : 0; 

    // 3. Compute trade stats
    const tradeStats = this.computeTradeStatsFromHistory(closedPositions);

    return {
      meta: {
        account_id: "global",
        last_sync: new Date().toISOString(),
        currency: "USD",
        broker: "Múltiple",
        server: "Global Server",
        day_from: dayFrom || "N/A",
        day_to: dayTo || "N/A",
      },
      account_info: {
        balance: totalBalance,
        equity: totalEquity,
        free_margin: totalFreeMargin,
        open_trades: totalOpenTrades,
        state: anyConnected ? "CONNECTED" : "DESCONECTADA",
        broker: "Múltiple",
        name: "Portafolio Global",
        ccyToUSD: 1,
        ccyToEUR: accounts[0]?.ccyToEUR || 0.85, 
        environment: "Múltiple",
        login: "Varias Cuentas",
        subscription_name: `${accounts.length} Cuentas Vinculadas`,
        expiration: "N/A",
      },
      technical_stats: {
        equity_start: startEquity,
        equity_end: totalEquityEndFromReports || totalEquity, 
        hwm: hwmTotal,
        deposit_withdrawal: depositWithdrawal,
        pnl_usd: pnlUsd,
        pnl_eur: pnlEur,
        performance_percent: performance,
      },
      summary: {
        total_trades: {
          won: tradeStats.won_trades,
          lost: tradeStats.lost_trades,
          total: tradeStats.total_trades,
        },
        performance: {
          pnl: pnlUsd,
          performance_percent: performance,
        },
        risk: {
          current_equity: totalEquity,
          current_balance: totalBalance,
          highest_balance: hwmTotal,
        },
      },
      capital_flows: {
        deposit_withdrawal: depositWithdrawal,
      },
      trade_stats: tradeStats,
      charts: { equity_curve: [], daily_pnl_distribution: [] },
      calendar: [],
    };
  },

  /**
   * Merges real-time account data from the accounts endpoint into the financial response.
   * This fills balance, equity, free_margin, open_trades, state, etc.
   */
  mergeAccountData(financial: FinancialDashboardResponse, account: any): FinancialDashboardResponse {
    return {
      ...financial,
      meta: {
        ...financial.meta,
        currency: account.ccy || financial.meta.currency,
        broker: account.broker || financial.meta.broker,
        last_sync: account.lastUpdate || financial.meta.last_sync,
      },
      account_info: {
        balance: parseFloat(account.balance) || 0,
        equity: parseFloat(account.equity) || 0,
        free_margin: parseFloat(account.free_margin) || 0,
        open_trades: parseInt(account.open_trades) || 0,
        state: account.state || "UNKNOWN",
        broker: account.broker || "Unknown",
        name: account.name || "Account",
        ccyToUSD: parseFloat(account.ccyToUSD) || 1,
        ccyToEUR: parseFloat(account.ccyToEUR) || 1,
        environment: account.environment || 'N/A',
        login: account.login || account.account || 'N/A',
        subscription_name: account.subscription_name || 'N/A',
        expiration: account.expiration || 'N/A',
      },
      summary: {
        ...financial.summary,
        risk: {
          ...financial.summary.risk,
          current_equity: parseFloat(account.equity) || financial.summary.risk.current_equity,
          current_balance: parseFloat(account.balance) || financial.summary.risk.current_balance,
        },
      },
    };
  },

  /**
   * Computes trade statistics from closed positions history.
   * This derives win_rate, profit_factor, avg_win/loss, and avg_duration
   * from actual trade data instead of relying on nonexistent API fields.
   */
  computeTradeStatsFromHistory(positions: any[]): FinancialDashboardResponse['trade_stats'] {
    if (!positions || positions.length === 0) {
      return {
        win_rate: 0,
        profit_factor: 0,
        avg_win: 0,
        avg_loss: 0,
        avg_win_loss_ratio: "N/A",
        avg_duration: "Sin operaciones",
        total_trades: 0,
        won_trades: 0,
        lost_trades: 0,
      };
    }

    const wins = positions.filter(p => parseFloat(p.profit) > 0);
    const losses = positions.filter(p => parseFloat(p.profit) < 0);
    const totalTrades = positions.length;
    const wonTrades = wins.length;
    const lostTrades = losses.length;

    // Win rate
    const winRate = (wonTrades / totalTrades) * 100;

    // Sum of wins and losses
    const sumWins = wins.reduce((sum, p) => sum + parseFloat(p.profit), 0);
    const sumLosses = losses.reduce((sum, p) => sum + Math.abs(parseFloat(p.profit)), 0);

    // Profit factor
    const profitFactor = sumLosses > 0 ? sumWins / sumLosses : sumWins > 0 ? Infinity : 0;

    // Average win/loss
    const avgWin = wonTrades > 0 ? sumWins / wonTrades : 0;
    const avgLoss = lostTrades > 0 ? sumLosses / lostTrades : 0;

    // Avg Win/Loss Ratio
    const avgWinLossRatio = avgLoss > 0
      ? `${(avgWin / avgLoss).toFixed(1)}:1`
      : avgWin > 0 ? "∞:1" : "N/A";

    // Average duration
    let avgDuration = "N/A";
    try {
      const durations = positions
        .filter(p => p.time_open && p.time_close)
        .map(p => {
          const open = new Date(p.time_open).getTime();
          const close = new Date(p.time_close).getTime();
          return close - open;
        })
        .filter(d => d > 0);

      if (durations.length > 0) {
        const avgMs = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const avgHours = avgMs / (1000 * 60 * 60);
        if (avgHours < 1) {
          avgDuration = `${Math.round(avgMs / (1000 * 60))}m`;
        } else if (avgHours < 24) {
          avgDuration = `${avgHours.toFixed(1)}h`;
        } else {
          avgDuration = `${(avgHours / 24).toFixed(1)}d`;
        }
      }
    } catch {
      avgDuration = "N/A";
    }

    return {
      win_rate: Math.round(winRate * 10) / 10,
      profit_factor: Math.round(profitFactor * 100) / 100,
      avg_win: Math.round(avgWin * 100) / 100,
      avg_loss: Math.round(avgLoss * 100) / 100,
      avg_win_loss_ratio: avgWinLossRatio,
      avg_duration: avgDuration,
      total_trades: totalTrades,
      won_trades: wonTrades,
      lost_trades: lostTrades,
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
   * Creates a fallback FinancialDashboardResponse when no reporting data is available.
   * Merges account data if available.
   */
  createEmptyFinancial(account: any): FinancialDashboardResponse {
    return {
      meta: {
        account_id: account.account_id,
        last_sync: account.lastUpdate || new Date().toISOString(),
        currency: account.ccy || "USD",
        broker: account.broker || "Unknown",
        server: account.server || "Unknown",
        day_from: "N/A",
        day_to: "N/A",
      },
      account_info: {
        balance: parseFloat(account.balance) || 0,
        equity: parseFloat(account.equity) || 0,
        free_margin: parseFloat(account.free_margin) || 0,
        open_trades: parseInt(account.open_trades) || 0,
        state: account.state || "UNKNOWN",
        broker: account.broker || "Unknown",
        name: account.name || "Account",
        ccyToUSD: parseFloat(account.ccyToUSD) || 1,
        ccyToEUR: parseFloat(account.ccyToEUR) || 1,
        environment: account.environment || 'N/A',
        login: account.login || account.account || 'N/A',
        subscription_name: account.subscription_name || 'N/A',
        expiration: account.expiration || 'N/A',
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
        total_trades: { won: 0, lost: 0, total: 0 },
        performance: {
          pnl: 0,
          performance_percent: 0,
        },
        risk: {
          current_equity: parseFloat(account.equity) || 0,
          current_balance: parseFloat(account.balance) || 0,
          highest_balance: 0,
        },
      },
      capital_flows: {
        deposit_withdrawal: 0,
      },
      trade_stats: {
        win_rate: 0,
        profit_factor: 0,
        avg_win: 0,
        avg_loss: 0,
        avg_win_loss_ratio: "N/A",
        avg_duration: "Sin operaciones",
        total_trades: 0,
        won_trades: 0,
        lost_trades: 0,
      },
      charts: {
        equity_curve: [],
        daily_pnl_distribution: [],
      },
      calendar: [],
    };
  }
};
