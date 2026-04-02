import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "superadmin" && role !== "trader") {
      return NextResponse.json({ error: "No tienes permisos para crear configuraciones." }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, settings } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const {
      risk_factor_value,
      risk_factor_type,
      copier_status,
      max_order_size,
      min_order_size,
      pending_order,
      stop_loss,
      take_profit,
      stop_loss_fixed_format,
      take_profit_fixed_format,
      ...advancedSettings
    } = settings;

    const newConfig = await prisma.modelConfig.create({
      data: {
        userId: session.user.id,
        name,
        description,
        risk_factor_value: Number(risk_factor_value) || 1.0,
        risk_factor_type: Number(risk_factor_type) || 3,
        copier_status: Number(copier_status) || 1,
        max_order_size: max_order_size ? Number(max_order_size) : null,
        min_order_size: min_order_size ? Number(min_order_size) : null,
        pending_order: pending_order !== undefined ? Number(pending_order) : 1,
        stop_loss: stop_loss !== undefined ? Number(stop_loss) : 0,
        take_profit: take_profit !== undefined ? Number(take_profit) : 0,
        stop_loss_fixed_format: stop_loss_fixed_format !== undefined ? Number(stop_loss_fixed_format) : 2,
        take_profit_fixed_format: take_profit_fixed_format !== undefined ? Number(take_profit_fixed_format) : 2,
        advancedSettings,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Configuración guardada exitosamente",
      data: newConfig,
    });
  } catch (error) {
    console.error("Create Model Config Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
