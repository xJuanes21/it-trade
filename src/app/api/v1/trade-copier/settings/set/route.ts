import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTradeCopierHeaders } from "@/lib/trade-copier-headers";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

/**
 * POST /api/v1/trade-copier/settings/set
 * Proxies a setSettings request to the external Trade Copier API.
 * Accepts: { payload: [{ id_slave, id_master?, risk_factor_value, ... }, ...] }
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const payload = body.payload;

    let externalHeaders;
    try {
      externalHeaders = await getTradeCopierHeaders(session.user.id);
    } catch (err: any) {
      if (err.message === "CredentialsApiConfigurationMissing") {
        return NextResponse.json({ 
          error: "Configuración Faltante", 
          message: "Debes configurar tus credenciales de API en el módulo de Configuraciones primero." 
        }, { status: 400 });
      }
      throw err;
    }

    if (payload) {
      // 1. Collect all unique IDs from payload (alphanumeric OR with underscores)
      const isArray = Array.isArray(payload);
      const items = isArray ? payload : Object.values(payload);
      const internalIds = new Set<string>();
      items.forEach((item: any) => {
        if (item.id_slave) internalIds.add(String(item.id_slave));
        if (item.id_master) internalIds.add(String(item.id_master));
      });

      // 2. Resolve them to numeric logins (Account login is the golden ID for External API)
      let idMap = new Map();
      if (internalIds.size > 0) {
        const accounts = await prisma.tradeCopierAccount.findMany({
          where: { 
            OR: [
              { account_id: { in: Array.from(internalIds) } },
              { groupid: { in: Array.from(internalIds) } } // Also check if it matches a groupid
            ]
          },
          select: { account_id: true, login: true, groupid: true }
        });
        
        accounts.forEach(a => {
           idMap.set(a.account_id, a.login);
           if (a.groupid) idMap.set(a.groupid, a.login);
        });
      }

      // 3. Transformation logic: Resolve IDs and ENSURE DICTIONARY FORMAT
      const transform = async (item: any) => {
        const newItem = { ...item };

        // AUTO-INJECT id_master if missing but id_group is present
        if (!newItem.id_master && newItem.id_group) {
          const modelByGroup = await prisma.tradingModel.findFirst({
            where: { group_id: String(newItem.id_group) }
          });
          
          if (modelByGroup?.masterAccountId) {
            const masterAcc = await prisma.tradeCopierAccount.findUnique({
              where: { account_id: modelByGroup.masterAccountId }
            });
            if (masterAcc?.login) {
              newItem.id_master = masterAcc.login;
              console.log(`[Proxy/Settings] Auto-injected id_master ${newItem.id_master} for group ${newItem.id_group}`);
            }
          }
        }

        // Resolve internal IDs to numeric logins if they match anything in our map
        if (newItem.id_slave && idMap.has(String(newItem.id_slave))) newItem.id_slave = idMap.get(String(newItem.id_slave));
        if (newItem.id_master && idMap.has(String(newItem.id_master))) newItem.id_master = idMap.get(String(newItem.id_master));
        
        // Final fallback: Ensure IDs are numbers if they look like numbers
        if (newItem.id_slave && !isNaN(Number(newItem.id_slave))) newItem.id_slave = Number(newItem.id_slave);
        if (newItem.id_master && !isNaN(Number(newItem.id_master))) newItem.id_master = Number(newItem.id_master);
        
        const numericFields = [
          'risk_factor_value', 'risk_factor_type', 'copier_status', 
          'pending_order', 'stop_loss', 'take_profit', 
          'max_delay', 'max_slippage', 'order_side',
          'stop_loss_fixed_format', 'take_profit_fixed_format',
          'stop_loss_fixed_value', 'take_profit_fixed_value'
        ];

        numericFields.forEach(field => {
          if (newItem[field] !== undefined && newItem[field] !== null && newItem[field] !== "") {
            newItem[field] = Number(newItem[field]);
          }
        });

        return newItem;
      };

      // The external API requires a dictionary (object) where keys are IDs (slave or group)
      const newPayload: Record<string, any> = {};
      
      for (const item of items) {
          const transformed = await transform(item);
          // NEW STRATEGY: Use the ID itself as the key (alphanumeric or numeric)
          // Documentation for setSettings usually expects keys to be the Slave ID or Group ID
          const key = String(transformed.id_slave || transformed.id_group || transformed.id_master);
          if (key && key !== "undefined") {
            newPayload[key] = transformed;
          }
      }

      // 4. SIMULATION BYPASS
      const containsSimulated = items.some((item: any) => 
        (item.id_slave && String(item.id_slave).includes("sim_acc_")) || 
        (item.id_master && String(item.id_master).includes("sim_acc_"))
      );
      
      if (containsSimulated) {
        console.log("[Simulation] Bypassing external settings/set for simulated accounts");
        for (const item of items) {
          if (item.id_slave && String(item.id_slave).includes("sim_acc_")) {
            const targetGroupId = item.copier_status === 0 ? null : item.id_group;
            await prisma.tradeCopierAccount.update({
              where: { account_id: item.id_slave },
              data: { groupid: targetGroupId }
            }).catch(err => console.warn("Failed to update simulated account groupid:", err));
          }
        }

        return NextResponse.json({
          status: "success",
          message: "[Simulated] Configuraçión aplicada localmente exitosamente.",
          data: { updated: items.length }
        });
      }

      body.payload = newPayload;
    }

    console.log(`[API/Settings-Set] Forwarding to External API. Final JSON:`, JSON.stringify(body, null, 2));

    const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/settings/set`, {
      method: "POST",
      headers: {
        ...externalHeaders,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    const contentType = externalResponse.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const result = await externalResponse.json();
      return NextResponse.json(result, { status: externalResponse.status });
    }

    const text = await externalResponse.text();
    console.error("Settings Set - Non-JSON Response:", text);
    return NextResponse.json(
      {
        error: "External API Error",
        message: "El Servidor de IT TRADE devolvió un formato inesperado al actualizar parámetros.",
        details: text.substring(0, 100),
      },
      { status: externalResponse.status || 502 }
    );
  } catch (error) {
    console.error("Settings Set Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

