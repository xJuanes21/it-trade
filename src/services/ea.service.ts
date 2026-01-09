import { CreateEaConfigData, EaConfig, EaStatus, Mt5ConnectionData } from "@/types/ea";

export const eaService = {
  async connectMt5(data: Mt5ConnectionData): Promise<void> {
    const response = await fetch("/api/v1/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to connect to MT5");
    }
  },

  async getConfigs(): Promise<EaConfig[]> {
    const response = await fetch("/api/v1/ea/config");
    if (!response.ok) {
        throw new Error("Failed to fetch configs");
    }
    return response.json();
  },

  async createConfig(data: CreateEaConfigData): Promise<EaConfig> {
    const response = await fetch("/api/v1/ea/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create config");
    }
    return response.json();
  },

  async updateConfig(magicNumber: number, data: Partial<CreateEaConfigData>): Promise<EaConfig> {
    const response = await fetch(`/api/v1/ea/config/${magicNumber}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to update config");
    }
    return response.json();
  },

  async deleteConfig(magicNumber: number): Promise<void> {
    const response = await fetch(`/api/v1/ea/config/${magicNumber}`, {
      method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete config");
    }
  },

  async enableEa(magicNumber: number): Promise<void> {
    const response = await fetch(`/api/v1/ea/config/${magicNumber}/enable`, {
      method: "POST",
    });

    if (!response.ok) {
        throw new Error("Failed to enable EA");
    }
  },

  async disableEa(magicNumber: number): Promise<void> {
    const response = await fetch(`/api/v1/ea/config/${magicNumber}/disable`, {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error("Failed to disable EA");
    }
  },

  async getEaStatus(magicNumber: number): Promise<EaStatus> {
    const response = await fetch(`/api/v1/ea/status/${magicNumber}`);
    if (!response.ok) {
        throw new Error("Failed to fetch status");
    }
    return response.json();
  }
};
