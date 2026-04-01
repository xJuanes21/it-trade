import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, name, description, settings, isPublic } = await req.json();

    if (!id) return NextResponse.json({ error: "ID del modelo requerido." }, { status: 400 });

    // 1. Get the model
    // @ts-ignore - group_id might not be in the local types yet but it is in the DB
    const model = await prisma.tradingModel.findUnique({
      where: { id },
      include: { modelConfig: true }
    });

    if (!model || (model.userId !== session.user.id && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "No se encontró el modelo o no tienes permisos." }, { status: 404 });
    }

    // 2. Sync with External API
    // @ts-ignore
    let currentGroupId = model.group_id;

    if (!currentGroupId && name) {
      // Create late link if it didn't exist
      try {
        const templateResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/template/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: { name } }),
        });
        const templateData = await templateResponse.json();
        if (templateData.status === "success" && templateData.data?.group_id) {
          currentGroupId = templateData.data.group_id;
        }
      } catch (err) {
        console.error("Delayed external sync error:", err);
      }
    }

    if (currentGroupId) {
       // A. Edit name
       if (name && name !== model.name) {
          await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/template/edit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload: { group_id: currentGroupId, name } }),
          });
       }

       // B. Technical parameters
       if (settings) {
          const settingsPayload = {
            id_group: currentGroupId,
            risk_factor_value: settings.risk_factor_value,
            risk_factor_type: settings.risk_factor_type,
            copier_status: settings.copier_status,
            max_order_size: settings.max_order_size,
            min_order_size: settings.min_order_size,
            pending_order: settings.pending_order,
            stop_loss: settings.stop_loss,
            take_profit: settings.take_profit,
            stop_loss_fixed_format: settings.stop_loss_fixed_format,
            take_profit_fixed_format: settings.take_profit_fixed_format,
          };

          // CRITICAL: External API expects dictionary keyed by group_id
          const dictPayload: Record<string, any> = {};
          dictPayload[currentGroupId] = settingsPayload;

          await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/settings/set`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload: dictPayload }),
          });
       }

    }

    // 3. Update Local Prisma
    // @ts-ignore
    const updatedModel = await prisma.tradingModel.update({
      where: { id },
      data: {
        name: name ?? undefined,
        description: description ?? undefined,
        isPublic: isPublic ?? undefined,
        // @ts-ignore
        group_id: currentGroupId ?? undefined,
        modelConfig: settings ? {
          update: {
            risk_factor_value: settings.risk_factor_value,
            risk_factor_type: settings.risk_factor_type,
            copier_status: settings.copier_status,
            stop_loss: settings.stop_loss,
            take_profit: settings.take_profit,
            max_order_size: settings.max_order_size,
            min_order_size: settings.min_order_size,
            pending_order: settings.pending_order,
            stop_loss_fixed_format: settings.stop_loss_fixed_format,
            take_profit_fixed_format: settings.take_profit_fixed_format,
          }
        } : undefined
      },
      include: {
        modelConfig: true,
        user: { select: { name: true } }
      }
    });

    return NextResponse.json({ success: true, data: updatedModel });
  } catch (error) {
    console.error("Update Model Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
