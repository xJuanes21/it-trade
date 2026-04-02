/**
 * Tipos de datos para el módulo Copy Trader basados en la especificación de API
 */

export type AccountType = 0 | 1; // 0 = Master, 1 = Slave
export type StatusType = 0 | 1; // 0 = disabled, 1 = enabled
export type AlertStatus = 0 | 1; // 0 = off, 1 = on

export type BrokerType =
  | "mt4"
  | "mt5"
  | "ctrader"
  | "fxcm_fc"
  | "lmax"
  | "dxtrade"
  | "fortex"
  | "tradovate";

export interface Account {
  account_id?: string;
  type: AccountType;
  name: string;
  broker: BrokerType;
  login: string;
  password?: string;
  server: string;
  environment?: "Real" | "Demo";
  status: StatusType; 
  group?: string; // One of your existing template's ID.
  subscription?: string; // subscription key or "auto"
  alert_email?: AlertStatus; // 0=disabled, 1=enabled

  // Específicos cTrader
  access_token?: string;
  refresh_token?: string;
  expiry_token?: string; // default value 2628000
  client_id?: string;
  client_secret?: string;

  // Campos de respuesta y configuración avanzada (getAccounts)
  account_name?: string;
  state?: string;
  balance?: string;
  equity?: string;
  free_margin?: string;
  ccy?: string;
  lastUpdate?: string;
  
  isOwner?: boolean;
  ownerEmail?: string;

  // Alertas adicionales
  alert_sms?: AlertStatus;
  alert_email_failed?: AlertStatus;
  alert_sms_failed?: AlertStatus;

  // Config de copia (para Slave)
  pending?: StatusType;
  stop_loss?: StatusType;
  take_profit?: StatusType;
  groupid?: string;
  subscription_key?: string;
  subscription_name?: string;
  expiration?: string;

  // Risk global
  globalstoploss?: StatusType;
  globalstoplosstype?: 0 | 1 | 2; // 0=Close Only, 1=Sell Out, 2=Frozen
  globalstoplossvalue?: number;
  globatakeprofit?: StatusType;
  globaltakeprofitvalue?: number;
  globaltakeprofittype?: 0 | 1 | 2;

  mode?: 0 | 1; // 0: Hedging, 1:Netting
  open_trades?: number;
}

export type RiskFactorType =
  | 0 // Auto Equity
  | 1 // Auto Balance
  | 2 // Auto Margin
  | 3 // Multiplier Notional
  | 4 // Fixed Lot
  | 5 | 6 | 7 // Fixed Leverage
  | 10 // Units
  | 11; // Multiplier Lot

export type CopierStatus =
  | -1 // Close only
  | 0 // Frozen
  | 1 // ON
  | 2; // Open only

export type FormatType = 0 | 1 | 2 | 3 | 4; // 0=%, 1=amount, 2=pips, 3=decimal, 4=% of SL distance (offsets)

export interface CopySettings {
  date?: string;
  id_master?: string; // Optional: Will be default for all masters if empty
  id_slave?: string; // XOR with id_group
  id_group?: string; // XOR with id_slave

  // Risk
  risk_factor_value: number;
  risk_factor_type: RiskFactorType;

  // Status & Side
  order_side?: -1 | 1; // -1: sell only, 1: buy only
  copier_status: CopierStatus;

  // Sizes
  max_order_size?: number;
  min_order_size?: number;

  // Symbols
  symbol_master?: string;
  symbol?: string;

  // SL / TP logic
  pending_order?: 0 | 1;
  stop_loss?: 0 | 1 | 2; // 0=off, 1=on, 2=on with updates
  stop_loss_fixed_value?: number;
  stop_loss_fixed_format?: FormatType;
  stop_loss_min_value?: number;
  stop_loss_min_format?: FormatType;
  stop_loss_max_value?: number;
  stop_loss_max_format?: FormatType;

  take_profit?: 0 | 1 | 2; // 0=off, 1=on, 2=on with updates
  take_profit_fixed_value?: number;
  take_profit_fixed_format?: FormatType;
  take_profit_min_value?: number;
  take_profit_min_format?: FormatType;
  take_profit_max_value?: number;
  take_profit_max_format?: FormatType;

  // Offsets (setSettings unique fields)
  stop_loss_offset_value?: number;
  stop_loss_offset_format?: FormatType;
  take_profit_offset_value?: number;
  take_profit_offset_format?: FormatType;

  // Trailing
  trailing_stop_value?: number;
  trailing_stop_format?: FormatType;

  // Slippage & Delay
  max_slippage?: number;
  max_delay?: number;

  // Risk Management
  max_risk_value?: number;
  max_risk_format?: FormatType;
  comment?: string;

  // Advanced logic
  force_min_round_up?: 0 | 1;
  round_down?: 0 | 1;
  split_order?: 0 | 1;
  price_type?: 0 | 1; // 0=OFF, 1=ON
  price_improvement?: number;

  // Limits
  max_position_size_a?: number;
  max_position_size_s?: number;
  max_open_count_a?: number;
  max_open_count_s?: number;
  max_daily_order_count_a?: number;
  max_daily_order_count_s?: number;

  // Global SL / TP
  global_stop_loss?: 0 | 1;
  global_stop_loss_value?: number;
  global_stop_loss_type?: 0 | 1 | 2; // 0=close, 1=sell out, 2=freeze
  global_take_profit?: 0 | 1;
  global_take_profit_value?: number;
  global_take_profit_type?: 0 | 1 | 2;

  // Extra helper fields
  master_name?: string;
  slave_name?: string;
  group_name?: string;
}

export interface Template {
  group_id?: string;
  name: string;
  description?: string;
  author?: string; // User who created it
  accounts_count?: number; // How many accounts are using it
  rules_count?: number; // How many rules/settings inside
  last_updated?: string;
}

// Mock Data
export const MOCK_ACCOUNTS: Account[] = [
  {
    account_id: "33934",
    type: 0,
    name: "Master Account Alpha",
    broker: "mt4",
    login: "123456",
    server: "ForexServer-Main",
    status: 1,
    state: "CONNECTED",
    balance: "10500.25",
    equity: "10550.80",
    ccy: "USD"
  },
  {
    account_id: "29524",
    type: 1,
    name: "Slave Account Beta",
    broker: "ctrader",
    login: "987654",
    server: "cTrader-Live",
    status: 1,
    state: "CONNECTED",
    balance: "5200.00",
    equity: "5180.50",
    ccy: "USD"
  }
];

export const MOCK_TEMPLATES: Template[] = [
  {
    group_id: "G1",
    name: "Conservative Risk",
    author: "Admin Juan",
    description: "Low multiplier (0.5x) with tight SL. Ideal for large accounts.",
    accounts_count: 12,
    rules_count: 8,
    last_updated: "2024-03-20"
  },
  {
    group_id: "G2",
    name: "Aggressive Scalping",
    author: "Trader Mike",
    description: "High multiplier (2.0x). No SL, only manual control.",
    accounts_count: 5,
    rules_count: 4,
    last_updated: "2024-03-18"
  },
  {
    group_id: "G3",
    name: "Low Drawdown",
    author: "System Default",
    description: "Standard copy rules with basic risk management.",
    accounts_count: 45,
    rules_count: 12,
    last_updated: "2024-03-22"
  }
];

export const MOCK_SETTINGS: CopySettings[] = [
  {
    id_master: "33934",
    id_slave: "29524",
    risk_factor_value: 0.11,
    risk_factor_type: 3,
    copier_status: 1,
    master_name: "Master Account Alpha",
    slave_name: "Slave Account Beta"
  }
];
