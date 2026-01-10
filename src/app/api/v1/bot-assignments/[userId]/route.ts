import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/auth-utils";

/**
 * GET /api/v1/bot-assignments/[userId]
 * Obtiene los bots asignados a un usuario específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // Los usuarios pueden ver sus propias asignaciones
    // Los super admins pueden ver cualquier asignación
    if (session.user.id !== userId && !isSuperAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    // Si Prisma client no se ha regenerado, retornar array vacío
    if (!prisma.botAssignment) {
      console.warn("⚠️  Prisma client no regenerado. Ejecuta: npx prisma generate");
      return NextResponse.json([]);
    }

    const assignments = await prisma.botAssignment.findMany({
      where: { userId },
      include: {
        eaConfig: {
          select: {
            id: true,
            magicNumber: true,
            eaName: true,
            symbol: true,
            timeframe: true,
            lotSize: true,
            stopLoss: true,
            takeProfit: true,
            maxTrades: true,
            tradingHoursStart: true,
            tradingHoursEnd: true,
            riskPercent: true,
            enabled: true,
            customParams: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // Retornar solo los EaConfigs para facilitar el uso en el frontend
    const bots = assignments.map((assignment: any) => ({
      ...assignment.eaConfig,
      // Renombrar campos para coincidir con la interfaz EaConfig del frontend
      ea_name: assignment.eaConfig.eaName,
      magic_number: assignment.eaConfig.magicNumber,
      lot_size: assignment.eaConfig.lotSize,
      stop_loss: assignment.eaConfig.stopLoss,
      take_profit: assignment.eaConfig.takeProfit,
      max_trades: assignment.eaConfig.maxTrades,
      trading_hours_start: assignment.eaConfig.tradingHoursStart,
      trading_hours_end: assignment.eaConfig.tradingHoursEnd,
      risk_percent: assignment.eaConfig.riskPercent,
      custom_params: assignment.eaConfig.customParams,
      created_at: assignment.eaConfig.createdAt,
      updated_at: assignment.eaConfig.updatedAt,
    }));

    return NextResponse.json(bots);
  } catch (error) {
    console.error("Error fetching user bot assignments:", error);
    
    // Si el error es por modelo no encontrado, retornar array vacío
    if (error instanceof Error && error.message.includes("botAssignment")) {
      console.warn("⚠️  Modelo botAssignment no existe. Ejecuta: npx prisma migrate dev");
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: "Error al obtener asignaciones" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/bot-assignments/[userId]
 * Asigna un bot a un usuario (solo super admin)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Solo super admin puede asignar bots
    if (!isSuperAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const body = await request.json();
    const { magicNumber } = body;

    if (!magicNumber) {
      return NextResponse.json(
        { error: "magicNumber es requerido" },
        { status: 400 }
      );
    }

    // Si Prisma client no se ha regenerado, retornar error descriptivo
    if (!prisma.botAssignment) {
      console.error("⚠️  Prisma client no regenerado. Ejecuta: npx prisma migrate dev");
      return NextResponse.json(
        { error: "Sistema en configuración. Por favor contacta al administrador." },
        { status: 503 }
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el bot existe (primero en BD local, luego en API externo)
    let bot = await prisma.eaConfig.findUnique({
      where: { magicNumber },
    });

    // Si no está en BD local, verificar en API externo
    if (!bot) {
      try {
        const externalResponse = await fetch('https://mt5.ittradew.com/api/v1/ea/configs', {
          headers: {
            'accept': 'application/json'
          },
          cache: 'no-store'
        });

        if (externalResponse.ok) {
          const externalBots = await externalResponse.json();
          const externalBot = externalBots.find((b: any) => b.magic_number === magicNumber);
          
          if (externalBot) {
            // Bot existe en API externo, crear entrada en BD local para poder asignarlo
            bot = await prisma.eaConfig.create({
              data: {
                userId: user.id,
                eaName: externalBot.ea_name,
                magicNumber: externalBot.magic_number,
                symbol: externalBot.symbol,
                timeframe: externalBot.timeframe,
                lotSize: externalBot.lot_size,
                stopLoss: externalBot.stop_loss,
                takeProfit: externalBot.take_profit,
                maxTrades: externalBot.max_trades,
                tradingHoursStart: externalBot.trading_hours_start,
                tradingHoursEnd: externalBot.trading_hours_end,
                riskPercent: externalBot.risk_percent,
                enabled: externalBot.enabled,
                customParams: externalBot.custom_params || {},
              },
            });
          }
        }
      } catch (error) {
        console.error("Error fetching external bot:", error);
      }
      
      // Si aún no existe después de verificar API externo, retornar 404
      if (!bot) {
        return NextResponse.json(
          { error: "Bot no encontrado" },
          { status: 404 }
        );
      }
    }

    // Verificar si ya existe la asignación
    const existingAssignment = await prisma.botAssignment.findUnique({
      where: {
        userId_magicNumber: {
          userId,
          magicNumber,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "El bot ya está asignado a este usuario" },
        { status: 400 }
      );
    }

    // Crear la asignación
    const assignment = await prisma.botAssignment.create({
      data: {
        userId,
        magicNumber,
      },
      include: {
        eaConfig: true,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Error assigning bot:", error);
    
    // Si el error es por modelo no encontrado
    if (error instanceof Error && error.message.includes("botAssignment")) {
      console.error("⚠️  Modelo botAssignment no existe. Ejecuta: npx prisma migrate dev");
      return NextResponse.json(
        { error: "Sistema en configuración. Por favor contacta al administrador." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Error al asignar bot" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/bot-assignments/[userId]
 * Remueve la asignación de un bot a un usuario (solo super admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Solo super admin puede remover asignaciones
    if (!isSuperAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const magicNumber = searchParams.get("magicNumber");

    if (!magicNumber) {
      return NextResponse.json(
        { error: "magicNumber es requerido" },
        { status: 400 }
      );
    }

    // Si Prisma client no se ha regenerado, retornar error descriptivo
    if (!prisma.botAssignment) {
      console.error("⚠️  Prisma client no regenerado. Ejecuta: npx prisma migrate dev");
      return NextResponse.json(
        { error: "Sistema en configuración. Por favor contacta al administrador." },
        { status: 503 }
      );
    }

    // Eliminar la asignación
    const deletedAssignment = await prisma.botAssignment.deleteMany({
      where: {
        userId,
        magicNumber: parseInt(magicNumber),
      },
    });

    if (deletedAssignment.count === 0) {
      return NextResponse.json(
        { error: "Asignación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing bot assignment:", error);
    
    // Si el error es por modelo no encontrado
    if (error instanceof Error && error.message.includes("botAssignment")) {
      console.error("⚠️  Modelo botAssignment no existe. Ejecuta: npx prisma migrate dev");
      return NextResponse.json(
        { error: "Sistema en configuración. Por favor contacta al administrador." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Error al remover asignación" },
      { status: 500 }
    );
  }
}
