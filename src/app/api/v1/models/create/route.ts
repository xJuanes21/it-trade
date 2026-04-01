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
    // NOTE: This step is NON-BLOCKING. If it fails, we still save to local DB
    // so the template is not orphaned. The user can update settings later.
    let settingsError: string | null = null;
    try {
      const settingsPayload = {
        id_group: externalGroupId,
        risk_factor_value: settings?.risk_factor_value || 1.0,
        risk_factor_type: settings?.risk_factor_type || 3,
        copier_status: settings?.copier_status ?? 1,
        max_order_size: settings?.max_order_size,
        min_order_size: settings?.min_order_size,
        pending_order: settings?.pending_order ?? 1,
        stop_loss: settings?.stop_loss ?? 0,
        take_profit: settings?.take_profit ?? 0,
        stop_loss_fixed_format: settings?.stop_loss_fixed_format ?? 2,
        take_profit_fixed_format: settings?.take_profit_fixed_format ?? 2,
      };

      // CRITICAL: The external FastAPI expects payload as a DICTIONARY
      // keyed by the group_id: { "GROUP_ID": { ...settings } }
      const dictPayload: Record<string, any> = {};
      dictPayload[externalGroupId] = settingsPayload;

      const settingsResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/settings/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: dictPayload }),
        signal: AbortSignal.timeout(15000)
      });

      if (!settingsResponse.ok) {
        const text = await settingsResponse.text();
        settingsError = `Settings sync falló (${settingsResponse.status}). Se guardará localmente.`;
        console.warn("External Settings Set Warning:", text.substring(0, 200));
      } else {
        const settingsData = await settingsResponse.json();
        if (settingsData.status !== "success") {
          settingsError = "Settings sync: respuesta no exitosa. Se guardará localmente.";
          console.warn("Settings non-success response:", settingsData);
        }
      }
    } catch (err: any) {
      settingsError = "Settings sync timeout/error. Se guardará localmente.";
      console.warn("External Settings Set Error (non-blocking):", err.message);
    }


    // 3. STEP THREE: Finalize in Local Database (Atomic)
    // -------------------------------------------------------------------------
    const newModel = await prisma.$transaction(async (tx) => {
      const newConfig = await tx.modelConfig.create({
        data: {
          userId: session.user.id,
          name: `Config - ${name}`,
          description: "Configuración técnica nativa del modelo",
          risk_factor_value: settings.risk_factor_value || 1.0,
          risk_factor_type: settings.risk_factor_type || 3,
          copier_status: settings.copier_status ?? 1,
          max_order_size: settings.max_order_size,
          min_order_size: settings.min_order_size,
          pending_order: settings.pending_order ?? 1,
          stop_loss: settings.stop_loss ?? 0,
          take_profit: settings.take_profit ?? 0,
          stop_loss_fixed_format: settings.stop_loss_fixed_format ?? 2,
          take_profit_fixed_format: settings.take_profit_fixed_format ?? 2,
          advancedSettings: {
            investment_min: investment_min ? Number(investment_min) : 0,
            monthly_fee: monthly_fee ? Number(monthly_fee) : 0,
            max_slippage: settings.max_slippage,
            max_delay: settings.max_delay,
            order_side: settings.order_side,
          } as any
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
          group_id: externalGroupId, // LINK TO EXTERNAL COPIER
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
