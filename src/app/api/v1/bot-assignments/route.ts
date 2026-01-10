import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/auth-utils";

/**
 * GET /api/v1/bot-assignments
 * Obtiene todas las asignaciones de bots (solo super admin)
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Solo super admin puede ver todas las asignaciones
    if (!isSuperAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const assignments = await prisma.botAssignment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        eaConfig: {
          select: {
            magicNumber: true,
            eaName: true,
            symbol: true,
            enabled: true,
          },
        },
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching bot assignments:", error);
    return NextResponse.json(
      { error: "Error al obtener asignaciones" },
      { status: 500 }
    );
  }
}
