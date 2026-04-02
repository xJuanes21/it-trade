import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, description, masterAccountId, settings, investment_min, monthly_fee, isPublic } = body;

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

    const advancedSettings = {
      ...restSettings,
      investment_min: investment_min ? Number(investment_min) : 0,
      monthly_fee: monthly_fee ? Number(monthly_fee) : 0,
    };

    if (!name || !masterAccountId) return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });

    // 1. STEP ONE: Create Template in External API
    // -------------------------------------------------------------------------
    let externalGroupId = null;
    try {
      const templateResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/template/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: { name } }),
        signal: AbortSignal.timeout(15000) // 15s timeout
      });

      if (templateResponse.ok) {
        const templateData = await templateResponse.json();
        if (templateData.status === "success" && templateData.data?.group_id) {
          externalGroupId = templateData.data.group_id;
        }
      } else {
        console.warn(`External Template Add failed with status ${templateResponse.status}, checking for existing name...`);
      }
    } catch (err: any) {
      console.warn("External Template Add Error or Timeout, falling back to name search:", err.message);
    }

    // FALLBACK: If we don't have externalGroupId, try to find it by name
    if (!externalGroupId) {
      try {
        const listRes = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/template/get`, {
            headers: { "Accept": "application/json" }
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          if (listData.status === "success" && Array.isArray(listData.data?.groups)) {
            const existing = listData.data.groups.find((g: any) => g.name === name);
            if (existing) {
              externalGroupId = existing.group_id;
              console.log("Found existing group_id via fallback search:", externalGroupId);
            }
          }
        }
      } catch (searchErr) {
        console.error("Fallback search failed:", searchErr);
      }
    }

    if (!externalGroupId) {
      return NextResponse.json({ 
        error: "Sync Error", 
        message: "No se pudo sincronizar el modelo con el Servidor de IT TRADE. No se pudo verificar la creación remota." 
      }, { status: 502 });
    }

    // 2. STEP TWO: Set technical Settings for that Group Id in External API
    // -------------------------------------------------------------------------
    let settingsError: string | null = null;
    try {
      const settingsPayload = {
        id_group: externalGroupId,
        risk_factor_value: Number(risk_factor_value ?? 1.0),
        risk_factor_type: Number(risk_factor_type ?? 3),
        copier_status: Number(copier_status ?? 1),
        max_order_size: max_order_size ? Number(max_order_size) : undefined,
        min_order_size: min_order_size ? Number(min_order_size) : undefined,
        pending_order: Number(pending_order ?? 1),
        stop_loss: Number(stop_loss ?? 0),
        take_profit: Number(take_profit ?? 0),
        stop_loss_fixed_format: Number(stop_loss_fixed_format ?? 2),
        take_profit_fixed_format: Number(take_profit_fixed_format ?? 2),
      };

      const dictPayload: Record<string, any> = {};
      dictPayload[externalGroupId] = settingsPayload;

      const settingsResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/settings/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: dictPayload }),
        signal: AbortSignal.timeout(15000)
      });

      if (!settingsResponse.ok) {
        settingsError = `Settings sync falló (${settingsResponse.status})`;
      }
    } catch (err: any) {
      settingsError = "Settings sync failed (non-blocking)";
    }


    // 3. STEP THREE: Finalize in Local Database (Atomic)
    const newModel = await prisma.$transaction(async (tx) => {
      const newConfig = await tx.modelConfig.create({
        data: {
          userId: session.user.id,
          name: `Config - ${name}`,
          description: "Configuración técnica nativa del modelo",
          risk_factor_value: risk_factor_value !== undefined ? Number(risk_factor_value) : 1.0,
          risk_factor_type: risk_factor_type !== undefined ? Number(risk_factor_type) : 3,
          copier_status: copier_status !== undefined ? Number(copier_status) : 1,
          max_order_size: max_order_size !== undefined && max_order_size !== "" ? Number(max_order_size) : null,
          min_order_size: min_order_size !== undefined && min_order_size !== "" ? Number(min_order_size) : null,
          pending_order: pending_order !== undefined ? Number(pending_order) : 1,
          stop_loss: stop_loss !== undefined ? Number(stop_loss) : 0,
          take_profit: take_profit !== undefined ? Number(take_profit) : 0,
          stop_loss_fixed_format: stop_loss_fixed_format !== undefined ? Number(stop_loss_fixed_format) : 2,
          take_profit_fixed_format: take_profit_fixed_format !== undefined ? Number(take_profit_fixed_format) : 2,
          advancedSettings: advancedSettings as any
        }
      });

      return await (tx.tradingModel as any).create({
        data: {
          userId: session.user.id,
          name,
          description,
          masterAccountId,
          configId: newConfig.id,
          isPublic: isPublic ?? true,
          group_id: externalGroupId, 
          ownerId: session.user.id,
          isClone: false,
        },
        include: {
          user: { select: { name: true } },
          modelConfig: true,
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: settingsError 
        ? "Plantilla creada localmente. Configuración técnica pendiente de sincronizar." 
        : "Plantilla creada y sincronizada exitosamente",
      warning: settingsError || undefined,
      data: newModel,
    });
  } catch (error) {
    console.error("Create Model Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
