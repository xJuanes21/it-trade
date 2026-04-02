import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, name, description, masterAccountId, settings, isPublic, investment_min, monthly_fee } = body;

    if (!id) return NextResponse.json({ error: "ID del modelo requerido." }, { status: 400 });

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
        ...restSettings
    } = settings || {};

    // 1. Get the model
    // @ts-ignore
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
            risk_factor_value: Number(risk_factor_value ?? 1.0),
            risk_factor_type: Number(risk_factor_type ?? 3),
            copier_status: Number(copier_status ?? 1),
            max_order_size: max_order_size !== undefined ? Number(max_order_size) : undefined,
            min_order_size: min_order_size !== undefined ? Number(min_order_size) : undefined,
            pending_order: Number(pending_order ?? 1),
            stop_loss: Number(stop_loss ?? 0),
            take_profit: Number(take_profit ?? 0),
            stop_loss_fixed_format: Number(stop_loss_fixed_format ?? 2),
            take_profit_fixed_format: Number(take_profit_fixed_format ?? 2),
            // Legacy/Extra fields
            ...(restSettings.max_slippage !== undefined && { max_slippage: Number(restSettings.max_slippage) }),
            ...(restSettings.max_delay !== undefined && { max_delay: Number(restSettings.max_delay) }),
            ...(restSettings.order_side !== undefined && { order_side: Number(restSettings.order_side) }),
            ...(restSettings.stop_loss_fixed_value !== undefined && { stop_loss_fixed_value: Number(restSettings.stop_loss_fixed_value) }),
            ...(restSettings.take_profit_fixed_value !== undefined && { take_profit_fixed_value: Number(restSettings.take_profit_fixed_value) })
          };

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
    // Merge or capture all advanced settings
    const advancedSettings = {
        ...restSettings,
        investment_min: investment_min !== undefined ? Number(investment_min) : undefined,
        monthly_fee: monthly_fee !== undefined ? Number(monthly_fee) : undefined,
    };

    const updatedModel = await prisma.tradingModel.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description ?? undefined,
        masterAccountId: masterAccountId || undefined,
        isPublic: isPublic ?? undefined,
        group_id: currentGroupId || undefined,
        modelConfig: {
          update: {
            risk_factor_value: risk_factor_value !== undefined ? Number(risk_factor_value) : undefined,
            risk_factor_type: risk_factor_type !== undefined ? Number(risk_factor_type) : undefined,
            copier_status: copier_status !== undefined ? Number(copier_status) : undefined,
            stop_loss: stop_loss !== undefined ? Number(stop_loss) : undefined,
            take_profit: take_profit !== undefined ? Number(take_profit) : undefined,
            max_order_size: max_order_size !== undefined ? (max_order_size === "" ? null : Number(max_order_size)) : undefined,
            min_order_size: min_order_size !== undefined ? (min_order_size === "" ? null : Number(min_order_size)) : undefined,
            pending_order: pending_order !== undefined ? Number(pending_order) : undefined,
            stop_loss_fixed_format: stop_loss_fixed_format !== undefined ? Number(stop_loss_fixed_format) : undefined,
            take_profit_fixed_format: take_profit_fixed_format !== undefined ? Number(take_profit_fixed_format) : undefined,
            advancedSettings: advancedSettings as any
          }
        }
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
