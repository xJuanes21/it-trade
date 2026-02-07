export interface DashboardAccount {
  login: number;
  name: string;
  server: string;
  account_type: string;
  balance: number;
  equity: number;
  is_active: boolean;
  last_sync: string;
}

export interface OperationalDashboardResponse {
  header: {
    user_name: string;
    last_sync: string;
    account_status: string;
  };
  metrics: {
    current_streak: number;
    best_streak: number;
    won_days_month: number;
    total_days_month: number;
    lost_trades_week: number;
    activity_percent: number;
  };
  charts: {
    trade_count: Array<{
      time: string;
      count: number;
    }>;
    daily_profit: Array<{
      day: string;
      profit: number;
    }>;
    top_symbols: Array<{
      symbol: string;
      trades: number;
    }>;
  };
  finance_summary: {
    gains_percent: number;
    net_pnl: number;
    period_returns: {
      daily: number;
      weekly: number;
      monthly: number;
      annualized: number;
    };
  };
}

export interface FinancialDashboardResponse {
  meta: {
    account_id: string;
    last_sync: string;
  };
  summary: {
    win_streak: {
      current: number;
      best: number;
      losses: number;
    };
    total_trades: {
      won: number;
      lost: number;
    };
    performance: {
      day_win: number;
      day_loss: number;
      avg_win: number;
      avg_loss: number;
      daily_winrate: number;
      total_winrate: number;
    };
    risk: {
      max_drawdown: number;
      current_equity: number;
      current_balance: number;
      highest_balance: number;
    };
  };
  capital_flows: {
    deposits: number;
    withdrawals: number;
    commissions: number;
    swap: number;
  };
  trade_stats: {
    win_rate: number;
    profit_factor: number;
    avg_win_loss_ratio: string;
    avg_duration: string;
  };
  charts: {
    equity_curve: Array<{
      date: string;
      equity: number;
    }>;
    daily_pnl_distribution: Array<{
      date: string;
      pnl: number;
      color: string;
    }>;
  };
  calendar: Array<{
    date: number;
    pnl: number;
    percent: number;
    trades: number;
    roi: boolean;
  }>;
}
