import { DashboardAccount, FinancialDashboardResponse, OperationalDashboardResponse } from "@/types/dashboard";

const API_BASE_URL = "/api/v1/dashboard";

export const dashboardService = {
  /**
   * Obtiene la lista de cuentas MT5 asociadas al usuario.
   */
  async getAccounts(): Promise<DashboardAccount[]> {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache" }
    });
    if (!response.ok) {
      throw new Error("Failed to fetch accounts");
    }
    return response.json();
  },

  /**
   * Obtiene las métricas operativas para el dashboard principal.
   */
  async getOperationalDashboard(login: number): Promise<OperationalDashboardResponse> {
    const response = await fetch(`${API_BASE_URL}/operational/${login}`);
    if (!response.ok) {
      throw new Error("Failed to fetch operational dashboard data");
    }
    return response.json();
  },

  /**
   * Obtiene las métricas financieras detalladas para el overview.
   */
  async getFinancialDashboard(login: number): Promise<FinancialDashboardResponse> {
    const response = await fetch(`${API_BASE_URL}/financial/${login}`);
    if (!response.ok) {
      throw new Error("Failed to fetch financial dashboard data");
    }
    return response.json();
  },

  /**
   * Conecta una nueva cuenta MT5 (Proxy + Backup).
   */
  async addAccount(data: { login: string; password: string; server: string }): Promise<void> {
    const response = await fetch("/api/v1/connect", { // Uses the CONNECT route as it handles backup
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to connect account");
    }
  },

  /**
   * Sincroniza la cuenta MT5 activa.
   */
  async syncAccount(): Promise<{ status: string; message: string; account: any }> {
    const response = await fetch("/api/v1/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al sincronizar la cuenta");
    }

    return response.json();
  },
};
