/**
 * Servicio para gestionar asignaciones de bots a usuarios
 */

const API_BASE = "/api/v1";

export interface BotAssignment {
  id: string;
  userId: string;
  magicNumber: number;
  assignedAt: string;
}

export const botAssignmentService = {
  /**
   * Obtiene los bots asignados a un usuario
   */
  async getUserBotAssignments(userId: string) {
    const res = await fetch(`${API_BASE}/bot-assignments/${userId}`);
    
    // Si no hay asignaciones (404 o 500 por primsa.botAssignment undefined), retornar array vacío
    if (!res.ok) {
      if (res.status === 404 || res.status === 500) {
        // Usuario sin bots asignados - esto es válido, no un error
        return [];
      }
      const error = await res.json();
      throw new Error(error.error || "Error al obtener asignaciones");
    }
    
    return res.json();
  },

  /**
   * Obtiene todas las asignaciones (solo super admin)
   */
  async getAllAssignments() {
    const res = await fetch(`${API_BASE}/bot-assignments`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error al obtener asignaciones");
    }
    return res.json();
  },

  /**
   * Asigna un bot a un usuario
   */
  async assignBotToUser(userId: string, magicNumber: number) {
    const res = await fetch(`${API_BASE}/bot-assignments/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ magicNumber }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error al asignar bot");
    }
    
    return res.json();
  },

  /**
   * Remueve la asignación de un bot a un usuario
   */
  async removeBotFromUser(userId: string, magicNumber: number) {
    const res = await fetch(
      `${API_BASE}/bot-assignments/${userId}?magicNumber=${magicNumber}`,
      {
        method: "DELETE",
      }
    );
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error al remover asignación");
    }
    
    return res.json();
  },

  /**
   * Actualiza las asignaciones de un usuario (asigna y remueve según sea necesario)
   */
  async updateUserAssignments(userId: string, magicNumbers: number[]) {
    // Obtener asignaciones actuales
    const currentBots = await this.getUserBotAssignments(userId);
    const currentMagicNumbers = currentBots.map((bot: any) => bot.magic_number);

    // Determinar qué bots agregar y cuáles remover
    const toAdd = magicNumbers.filter((mn) => !currentMagicNumbers.includes(mn));
    const toRemove = currentMagicNumbers.filter((mn: number) => !magicNumbers.includes(mn));

    // Ejecutar asignaciones y remociones
    const promises = [
      ...toAdd.map((mn) => this.assignBotToUser(userId, mn)),
      ...toRemove.map((mn: number) => this.removeBotFromUser(userId, mn)),
    ];

    await Promise.all(promises);
    
    return { added: toAdd.length, removed: toRemove.length };
  },
};
