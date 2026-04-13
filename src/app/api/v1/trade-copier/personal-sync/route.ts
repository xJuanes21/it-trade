import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTradeCopierHeaders } from "@/lib/trade-copier-headers";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

// GET: Fetch user's SyncConfigs
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const masterId = searchParams.get("masterId");

    const whereClause: any = { userId: session.user.id };
    if (masterId) {
      whereClause.masterAccountId = masterId;
    }

    const configs = await prisma.syncConfig.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    const formattedConfigs = configs.map((c: any) => {
      let extras = {};
      // @ts-ignore
      if (c.advancedSettings && typeof c.advancedSettings === 'object') {
        // @ts-ignore
        extras = c.advancedSettings;
      }
      return { ...c, ...extras };
    });

    return NextResponse.json({ status: "success", data: formattedConfigs });
  } catch (error: any) {
    console.error("GET PersonalSync Error:", error);
    return NextResponse.json({ status: "error", error: "Error interno al cargar configuraciones." }, { status: 500 });
  }
}

// POST: Create a new SyncConfig (and sync externally)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      masterAccountId,
      slaveAccountId,
      risk_factor_value,
      risk_factor_type,
      copier_status = 1,
      pending_order = 1,
      stop_loss = 0,
      take_profit = 0,
      stop_loss_fixed_format = 2,
      take_profit_fixed_format = 2,
      min_order_size,
      max_order_size,
      max_slippage,
      max_delay,
      order_side,
      stop_loss_fixed_value,
      take_profit_fixed_value
    } = body;

    if (!masterAccountId || !slaveAccountId) {
       return NextResponse.json({ status: "error", error: "Las cuentas Master y Slave son obligatorias." }, { status: 400 });
    }

    // 1. Resolve IDs to logins for external API
    const accounts = await prisma.tradeCopierAccount.findMany({
      where: {
        account_id: { in: [masterAccountId, slaveAccountId].filter(x => x !== undefined && x !== null) }
      },
      select: { account_id: true, login: true, type: true }
    });
    
    const idMap = new Map(accounts.map(a => [a.account_id, a.login]));
    const externalMasterId = idMap.has(masterAccountId) ? Number(idMap.get(masterAccountId)) : Number(masterAccountId);
    const externalSlaveId = idMap.has(slaveAccountId) ? Number(idMap.get(slaveAccountId)) : Number(slaveAccountId);

    if (isNaN(externalMasterId) || isNaN(externalSlaveId)) {
       return NextResponse.json({ 
         status: "error", 
         error: "Cuentas no válidas. Asegúrate de que ambas cuentas existan en el sistema." 
       }, { status: 400 });
    }

    // 2. Format payload for external API
    const externalPayload: any = {};
    externalPayload[String(externalSlaveId)] = {
      id_slave: externalSlaveId,
      id_master: externalMasterId,
      risk_factor_value: Number(risk_factor_value),
      risk_factor_type: Number(risk_factor_type),
      copier_status: Number(copier_status),
      pending_order: Number(pending_order),
      stop_loss: Number(stop_loss),
      take_profit: Number(take_profit),
      stop_loss_fixed_format: Number(stop_loss_fixed_format),
      take_profit_fixed_format: Number(take_profit_fixed_format),
      ...(min_order_size !== undefined && { min_order_size: Number(min_order_size) }),
      ...(max_order_size !== undefined && { max_order_size: Number(max_order_size) }),
      ...(max_slippage !== undefined && { max_slippage: Number(max_slippage) }),
      ...(max_delay !== undefined && { max_delay: Number(max_delay) }),
      ...(order_side !== undefined && { order_side: Number(order_side) }),
      ...(stop_loss_fixed_value !== undefined && { stop_loss_fixed_value: Number(stop_loss_fixed_value) }),
      ...(take_profit_fixed_value !== undefined && { take_profit_fixed_value: Number(take_profit_fixed_value) })
    };

    // 3. Make external request
    if (!String(slaveAccountId).includes("sim_acc_")) {
      try {
        const externalHeaders = await getTradeCopierHeaders(session.user.id);
        const extRes = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/settings/set`, {
          method: "POST",
          headers: { 
            ...externalHeaders,
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ payload: externalPayload }),
          signal: AbortSignal.timeout(10000) // 10s timeout
        });

        if (!extRes.ok) {
           const errText = await extRes.text();
           console.error("External API Sync Error:", errText);
           return NextResponse.json({ 
             status: "error", 
             error: `El servidor de IT TRADE devolvió un error (${extRes.status}).` 
           }, { status: extRes.status >= 500 ? 502 : 400 });
        }
      } catch (e: any) {
         console.error("Fetch/Timeout Error in Sync:", e.message);
         return NextResponse.json({ 
            status: "error", 
            error: "No se pudo sincronizar con el servidor remoto (Tiempo de espera agotado)." 
         }, { status: 504 });
      }
    }

    // 4. Save to Local DB (Upsert)
    const advancedSettingsFields = {
      max_slippage: max_slippage !== undefined && max_slippage !== null && max_slippage !== "" ? Number(max_slippage) : undefined,
      max_delay: max_delay !== undefined && max_delay !== null && max_delay !== "" ? Number(max_delay) : undefined,
      order_side: order_side !== undefined && order_side !== null && order_side !== "" ? Number(order_side) : undefined,
      stop_loss_fixed_value: stop_loss_fixed_value !== undefined && stop_loss_fixed_value !== null && stop_loss_fixed_value !== "" ? Number(stop_loss_fixed_value) : undefined,
      take_profit_fixed_value: take_profit_fixed_value !== undefined && take_profit_fixed_value !== null && take_profit_fixed_value !== "" ? Number(take_profit_fixed_value) : undefined,
    };

    const syncConfig = await prisma.syncConfig.upsert({
      where: {
        masterAccountId_slaveAccountId: {
          masterAccountId: String(masterAccountId),
          slaveAccountId: String(slaveAccountId)
        }
      },
      update: {
        risk_factor_value: Number(risk_factor_value),
        risk_factor_type: Number(risk_factor_type),
        copier_status: Number(copier_status),
        pending_order: Number(pending_order),
        stop_loss: Number(stop_loss),
        take_profit: Number(take_profit),
        stop_loss_fixed_format: Number(stop_loss_fixed_format),
        take_profit_fixed_format: Number(take_profit_fixed_format),
        min_order_size: min_order_size !== undefined && min_order_size !== null && min_order_size !== "" ? Number(min_order_size) : null,
        max_order_size: max_order_size !== undefined && max_order_size !== null && max_order_size !== "" ? Number(max_order_size) : null,
        advancedSettings: advancedSettingsFields as any
      },
      create: {
        userId: session.user.id,
        masterAccountId: String(masterAccountId),
        slaveAccountId: String(slaveAccountId),
        risk_factor_value: Number(risk_factor_value),
        risk_factor_type: Number(risk_factor_type),
        copier_status: Number(copier_status),
        pending_order: Number(pending_order),
        stop_loss: Number(stop_loss),
        take_profit: Number(take_profit),
        stop_loss_fixed_format: Number(stop_loss_fixed_format),
        take_profit_fixed_format: Number(take_profit_fixed_format),
        min_order_size: min_order_size !== undefined && min_order_size !== null && min_order_size !== "" ? Number(min_order_size) : null,
        max_order_size: max_order_size !== undefined && max_order_size !== null && max_order_size !== "" ? Number(max_order_size) : null,
        advancedSettings: advancedSettingsFields as any
      }
    });

    return NextResponse.json({ status: "success", data: syncConfig });
  } catch (error: any) {
    console.error("POST PersonalSync Error:", error);
    return NextResponse.json({ status: "error", error: "Error interno del servidor." }, { status: 500 });
  }
}

// DELETE: Remove a SyncConfig (unfollow essentially)
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ status: "error", error: "ID de configuración faltante" }, { status: 400 });

    const config = await prisma.syncConfig.findUnique({ where: { id } });
    if (!config) return NextResponse.json({ status: "error", error: "No se encontró la configuración." }, { status: 404 });
    
    if (config.userId !== session.user.id && session.user.role !== "superadmin") {
      return NextResponse.json({ status: "error", error: "Permisos insuficientes." }, { status: 403 });
    }

    // 1. Send update to external API setting copier_status to 0 (Pause)
    const externalSlaveId = isNaN(Number(config.slaveAccountId)) ? null : Number(config.slaveAccountId);
    if (externalSlaveId && !String(config.slaveAccountId).includes("sim_acc_")) {
         try {
            const externalHeaders = await getTradeCopierHeaders(session.user.id);
            const externalPayload: any = {};
            externalPayload[String(externalSlaveId)] = {
                id_slave: externalSlaveId,
                copier_status: 0 
            };
            await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/settings/set`, {
                method: "POST",
                headers: { 
                    ...externalHeaders,
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ payload: externalPayload }),
                signal: AbortSignal.timeout(5000)
            });
         } catch (e) {
            console.warn("External pause failed during delete, continuing with local delete.");
         }
    }

    // 2. Delete local config
    await prisma.syncConfig.delete({ where: { id } });

    return NextResponse.json({ status: "success", data: { id } });
  } catch (error: any) {
    console.error("DELETE PersonalSync Error:", error);
    return NextResponse.json({ status: "error", error: "Error fatal al eliminar sincronización." }, { status: 500 });
  }
}
