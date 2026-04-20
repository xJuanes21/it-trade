"use server";

import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";

async function logAudit(action: string, targetUserId: string, details?: string) {
  const session = await auth();
  const adminId = session?.user?.id;
  if (!adminId) return;

  await prisma.userAuditLog.create({
    data: {
      action,
      performedById: adminId,
      targetUserId,
      details,
    },
  });
}

export async function approveUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });
    await logAudit("APPROVE", userId, "User approved from requests");
    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error) {
    console.error("Error approving user:", error);
    return { error: "Error al aprobar usuario" };
  }
}

export async function rejectUser(userId: string) {
  try {
    // Audit before delete (targetUser will be null in log if we set SetNull, or we keep ID in details)
    await logAudit("REJECT", userId, "User rejected and deleted");

    // Permanent deletion for rejection
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting user:", error);
    return { error: "Error al rechazar usuario" };
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
    await logAudit(isActive ? "ENABLE" : "DISABLE", userId, `User ${isActive ? "enabled" : "disabled"}`);
    revalidatePath("/dashboard/usuarios");
    return { success: true };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return { error: "Error al cambiar estado" };
  }
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const session = await auth();
    if (session?.user?.role !== "superadmin") {
      return { error: "No autorizado" };
    }

    // STRICT ENFORCEMENT: If promoting to TRADER, verify API credentials exist
    if (newRole === "trader") {
      const credentials = await prisma.credentialsApi.findUnique({
        where: { userId }
      });

      if (!credentials) {
        return {
          error: "Para asignar el rol de Trader, primero debe configurar las credenciales de API del usuario en el módulo de Autenticación de Plataforma."
        };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    await logAudit("CHANGE_ROLE", userId, `Role changed to ${newRole}`);
    revalidatePath("/dashboard/usuarios");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { error: "Error al actualizar el rol" };
  }
}
