export interface EaConfig {
    ea_name: string;
    magic_number: number;
    symbol: string;
    timeframe: string;
    lot_size: number;
    stop_loss: number;
    take_profit: number;
    max_trades: number;
    trading_hours_start: number;
    trading_hours_end: number;
    risk_percent: number;
    enabled: boolean;
    custom_params?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
}

export interface CreateEaConfigData {
    ea_name: string;
    magic_number: number;
    symbol: string;
    timeframe: string;
    lot_size: number;
    stop_loss: number;
    take_profit: number;
    max_trades: number;
    trading_hours_start: number;
    trading_hours_end: number;
    risk_percent: number;
    enabled?: boolean;
    custom_params?: Record<string, any>;
}

export interface EaStatus {
    ea_name: string;
    magic_number: number;
    is_running: boolean;
    active_trades: number;
    total_profit: number;
    last_update: string;
}

export interface Mt5ConnectionData {
    login: string;
    password: string;
    server: string;
}
