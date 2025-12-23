type Dictionary<T = unknown> = Record<string, T>;

export type SymbolSummary = {
  name: string;
  description: string;
  bid: number;
  ask: number;
  spread: number;
  digits: number;
  point: number;
  trade_contract_size: number;
};

export type SymbolDetail = {
  name: string;
  description: string;
  currency_base: string;
  currency_profit: string;
  currency_margin: string;
  bid: number;
  bidhigh: number;
  bidlow: number;
  ask: number;
  askhigh: number;
  asklow: number;
  digits: number;
  spread: number;
  spread_float: boolean;
  ticks_bookdepth: number;
  swap_long: number;
  swap_short: number;
  volume_min: number;
  volume_max: number;
  volume_step: number;
  volume_limit: number;
  margin_initial: number;
  margin_maintenance: number;
  [key: string]: string | number | boolean;
};

export type Tick = {
  bid: number;
  ask: number;
  last?: number;
  volume?: number;
  time?: string | number;
};

export type HistoryRequest = {
  symbol: string;
  timeframe: "M1" | "M5" | "M15" | "M30" | "H1" | "H4" | "D1" | "W1" | "MN1";
  bars: number;
};

export type HistoryCandle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  spread: number;
};

const BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL ?? process.env.MT5_API_BASE_URL;

function getBaseUrl() {
  if (!BASE_URL) {
    throw new Error("MT5_API_BASE_URL (or NEXT_PUBLIC_MT5_API_BASE_URL) is not defined. Please configure it in your environment.");
  }
  return BASE_URL.replace(/\/$/, "");
}

function buildUrl(pathname: string) {
  return `${getBaseUrl()}${pathname}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MT5 API error (${response.status}): ${text || response.statusText}`);
  }
  return (await response.json()) as T;
}

const defaultHeaders = {
  Accept: "application/json",
};

export async function getSymbols(): Promise<SymbolSummary[]> {
  const res = await fetch(buildUrl("/api/v1/symbols"), {
    headers: defaultHeaders,
    cache: "no-store",
  });
  return handleResponse<SymbolSummary[]>(res);
}

export async function getSymbolInfo(symbol: string): Promise<SymbolDetail> {
  const res = await fetch(buildUrl(`/api/v1/symbol/${encodeURIComponent(symbol)}`), {
    headers: defaultHeaders,
    cache: "no-store",
  });
  return handleResponse<SymbolDetail>(res);
}

export async function getTick(symbol: string): Promise<Tick> {
  const res = await fetch(buildUrl(`/api/v1/tick/${encodeURIComponent(symbol)}`), {
    headers: defaultHeaders,
    cache: "no-store",
  });
  return handleResponse<Tick>(res);
}

export async function getHistory(payload: HistoryRequest): Promise<HistoryCandle[]> {
  const res = await fetch(buildUrl("/api/v1/history"), {
    method: "POST",
    headers: {
      ...defaultHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  return handleResponse<HistoryCandle[]>(res);
}

export const mt5Api = {
  getSymbols,
  getSymbolInfo,
  getTick,
  getHistory,
};

export type Mt5Api = typeof mt5Api;
