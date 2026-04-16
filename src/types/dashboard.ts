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
  meta?: {
    account_id: string;
    currency: string;
    broker: string;
    server: string;
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
    equity_curve?: Array<{
      date: string;
      equity: number;
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
  technical_stats?: {
    equity_start: number;
    equity_end: number;
    hwm: number;
    deposit_withdrawal: number;
    pnl_usd: number;
    pnl_eur: number;
    performance_percent: number;
  };
}

export interface FinancialDashboardResponse {
  meta: {
    account_id: string;
    last_sync: string;
    currency: string;
    broker: string;
    server: string;
    day_from: string;
    day_to: string;
  };
  account_info: {
    balance: number;
    equity: number;
    free_margin: number;
    open_trades: number;
    state: string;
    broker: string;
    name: string;
    ccyToUSD: number;
    ccyToEUR: number;
    environment: string;
    login: string;
    subscription_name: string;
    expiration: string;
  };
  technical_stats: {
    equity_start: number;
    equity_end: number;
    hwm: number;
    deposit_withdrawal: number;
    pnl_usd: number;
    pnl_eur: number;
    performance_percent: number;
  };
  summary: {
    total_trades: {
      won: number;
      lost: number;
      total: number;
    };
    performance: {
      pnl: number;
      performance_percent: number;
    };
    risk: {
      current_equity: number;
      current_balance: number;
      highest_balance: number;
    };
  };
  capital_flows: {
    deposit_withdrawal: number;
  };
  trade_stats: {
    win_rate: number;
    profit_factor: number;
    avg_win: number;
    avg_loss: number;
    avg_win_loss_ratio: string;
    avg_duration: string;
    total_trades: number;
    won_trades: number;
    lost_trades: number;
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
