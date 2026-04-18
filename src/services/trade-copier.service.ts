import { Account } from "@/lib/copy-trader-types";

/**
 * Service to interact with the Trade Copier Account Proxies
 * Follows the project's standard service pattern.
 */
export const tradeCopierService = {
  async getAccounts(filter: { account_id?: string | string[]; targetUserId?: string } = {}) {
    const response = await fetch("/api/v1/trade-copier/account/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filter),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to fetch accounts");
    }
    return response.json();
  },
  
  async getAccountsLocal() {
    const response = await fetch("/api/v1/accounts", {
      method: "GET",
      headers: { "Accept": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch local accounts");
    return response.json();
  },

  async registerAccountLocal(account: Partial<Account>) {
    const response = await fetch("/api/v1/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(account),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to register local account");
    }
    return response.json();
  },

  async addAccount(account: Partial<Account> & { targetUserId?: string }) {
    const response = await fetch("/api/v1/trade-copier/account/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(account),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to add account");
    }
    return response.json();
  },

  async updateAccount(account: Partial<Account> & { targetUserId?: string }) {
    const response = await fetch("/api/v1/trade-copier/account/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(account),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to update account");
    }
    return response.json();
  },

  async deleteAccount(accountId: string, targetUserId?: string) {
    const response = await fetch("/api/v1/trade-copier/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_id: accountId, targetUserId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to delete account");
    }
    return response.json();
  },

  async getServersList(broker: string, term: string = "", page: number = 1) {
    const response = await fetch("/api/v1/trade-copier/account/get-servers-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ broker, term, page: page.toString() }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to fetch servers list");
    }
    return response.json();
  },

  async getReporting(filter: { account_id?: string; global?: boolean; date_from?: string; date_to?: string } = {}) {
    const response = await fetch("/api/v1/trade-copier/reporting/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filter),
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        return { status: "error", message: error.message || error.error || "Failed to fetch reporting data" };
      } catch (e) {
        return { status: "error", message: "Error de red o respuesta inválida del servidor" };
      }
    }
    return response.json();
  },

  async getNotifications() {
    const response = await fetch("/api/v1/trade-copier/notification/get", {
      method: "GET",
      headers: { "Accept": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch notifications");
    return response.json();
  },

  async getPositionsOpen(filter: { account_id?: string } = {}) {
    const response = await fetch("/api/v1/trade-copier/position/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filter),
    });
    if (!response.ok) throw new Error("Failed to fetch open positions");
    return response.json();
  },

  async getPositionsClosed(filter: { account_id?: string; date_from?: string; date_to?: string } = {}) {
    const response = await fetch("/api/v1/trade-copier/position/closed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filter),
    });
    if (!response.ok) throw new Error("Failed to fetch closed positions");
    return response.json();
  },

  /**
   * Returns the user's account limit and current count.
   * Used to disable the "Vincular Cuenta" button when the limit is reached.
   */
  async getAccountLimit() {
    const response = await fetch("/api/v1/trade-copier/account/limit", {
      method: "GET",
      headers: { "Accept": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch account limit");
    return response.json();
  },

  /**
   * Retrieves copy settings from the Trade Copier API.
   * @param filter - Optional filter by id_slave, id_master, or id_group
   */
  async getSettings(filter: { id_slave?: string; id_master?: string; id_group?: string } = {}) {
    const response = await fetch("/api/v1/trade-copier/settings/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: filter }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to fetch settings");
    }
    return response.json();
  },

  /**
   * Sets/updates copy settings via the Trade Copier API.
   * @param settings - Array of settings objects to upsert
   */
  async setSettings(settings: Record<string, unknown>[]) {
    const response = await fetch("/api/v1/trade-copier/settings/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: settings }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to set settings");
    }
    return response.json();
  },
  /**
   * Templates (Groups) Management
   */
  async getTemplates() {
    const response = await fetch("/api/v1/trade-copier/template/get", {
      method: "GET",
      headers: { "Accept": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch templates");
    return response.json();
  },

  async addTemplate(name: string) {
    const response = await fetch("/api/v1/trade-copier/template/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: { name } }),
    });
    if (!response.ok) throw new Error("Failed to add template");
    return response.json();
  },

  async editTemplate(groupId: string, name: string) {
    const response = await fetch("/api/v1/trade-copier/template/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: { group_id: groupId, name } }),
    });
    if (!response.ok) throw new Error("Failed to edit template");
    return response.json();
  },

  async deleteTemplate(groupId: string) {
    const response = await fetch("/api/v1/trade-copier/template/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: { group_id: groupId } }),
    });
    if (!response.ok) throw new Error("Failed to delete template");
    return response.json();
  },

  /**
   * Copy Requests Management
   */
  async getCopyRequests() {
    const response = await fetch("/api/v1/copy-requests", {
      method: "GET",
      headers: { "Accept": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch copy requests");
    return response.json();
  },

  async sendCopyRequest(payload: { slaveAccountId: string; masterAccountId: string; traderId: string }) {
    const response = await fetch("/api/v1/copy-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to send copy request");
    }
    return response.json();
  },

  async updateCopyRequestStatus(requestId: string, status: string, message?: string) {
    const response = await fetch(`/api/v1/copy-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, message }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to update request status");
    }
    return response.json();
  },
  
  async linkAccount(account: Account, userId: string) {
    const response = await fetch("/api/v1/trade-copier/account/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account, targetUserId: userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to link account");
    }
    return response.json();
  },

  async unlinkAccount(accountId: string) {
    const response = await fetch("/api/v1/trade-copier/account/unlink", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_id: accountId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to unlink account");
    }
    return response.json();
  },
};
