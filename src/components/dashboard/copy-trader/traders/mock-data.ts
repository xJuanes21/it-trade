import { Account } from "@/lib/copy-trader-types";

export const MOCK_TRADERS: Account[] = [
  {
    account_id: "cJLfUUNUr",
    type: 0,
    name: "Master - PUPrime - MoW26553402",
    broker: "mt5",
    login: "26553402",
    server: "PUPrime-Live",
    status: 1,
    state: "CONNECTED",
    balance: "6183.03",
    equity: "6183.03",
    ccy: "USD",
  },
  {
    account_id: "tXfwUUNUr",
    type: 0,
    name: "Master - PUPrime - MoW26890402",
    broker: "mt5",
    login: "26890402",
    server: "PUPrime-Live",
    status: 1,
    state: "CONNECTED",
    balance: "6248.26",
    equity: "6248.26",
    ccy: "USD",
  },
  {
    account_id: "fdfwUUNUr",
    type: 0,
    name: "Master - PUPrime - ITW26890451",
    broker: "mt5",
    login: "26890451",
    server: "PUPrime-Live",
    status: 1,
    state: "CONNECTED",
    balance: "5719.55",
    equity: "5719.55",
    ccy: "USD",
  }
];

export const MOCK_TRADER_REPORT = {
  summary: {
    equity_start: 6556.23,
    equity_end: 6183.03,
    hwm: 6183.03,
    pnlUSD: -373.19,
    performance: -5.69,
    performance_label: "Rendimiento Total",
    performance_color: "#ef4444", 
    total_trades: {
      won: 42,
      lost: 12,
      total: 54
    },
    winrate: 77.7,
    history: [
      { date: "04-01", equity: 6556.23 },
      { date: "04-02", equity: 6580.12 },
      { date: "04-03", equity: 6420.50 },
      { date: "04-04", equity: 6490.00 },
      { date: "04-05", equity: 6380.45 },
      { date: "04-06", equity: 6250.30 },
      { date: "04-07", equity: 6183.03 }
    ]
  }
};
