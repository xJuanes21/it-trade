import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

    if (payload) {
      // 1. Collect all unique internal IDs from payload
      // Handle both array (legacy project format) and dictionary (API required format)
      const isArray = Array.isArray(payload);
      const items = isArray ? payload : Object.values(payload);
      const internalIds = new Set<string>();
      items.forEach((item: any) => {
        if (item.id_slave && String(item.id_slave).includes("_")) internalIds.add(item.id_slave);
        if (item.id_master && String(item.id_master).includes("_")) internalIds.add(item.id_master);
      });

      // 2. Resolve them to numeric logins in one query
      let idMap = new Map();
      if (internalIds.size > 0) {
        const accounts = await prisma.tradeCopierAccount.findMany({
          where: { account_id: { in: Array.from(internalIds) } },
          select: { account_id: true, login: true }
        });
        idMap = new Map(accounts.map(a => [a.account_id, a.login]));
      }

      // 3. Transformation logic: Resolve IDs and ENSURE DICTIONARY FORMAT
      const transform = (item: any) => {
        const newItem = { ...item };
        // Resolve internal IDs to numeric logins
        if (newItem.id_slave && idMap.has(newItem.id_slave)) newItem.id_slave = idMap.get(newItem.id_slave);
        if (newItem.id_master && idMap.has(newItem.id_master)) newItem.id_master = idMap.get(newItem.id_master);
        // CRITICAL: External API requires id_slave and id_master as INTEGERS
        if (newItem.id_slave && !isNaN(Number(newItem.id_slave))) newItem.id_slave = Number(newItem.id_slave);
        if (newItem.id_master && !isNaN(Number(newItem.id_master))) newItem.id_master = Number(newItem.id_master);
        return newItem;
      };

      // The external API requires a dictionary (object) where keys are IDs (slave or group)
      const newPayload: Record<string, any> = {};
      
      if (isArray) {
        payload.forEach((item: any, idx: number) => {
           const transformed = transform(item);
           const key = String(transformed.id_slave || transformed.id_group || idx);
           newPayload[key] = transformed;
        });
      } else {
        // If it's already a dictionary, we just resolve the IDs and keep/fix keys
        Object.keys(payload).forEach(k => {
           const transformed = transform(payload[k]);
           const key = String(transformed.id_slave || transformed.id_group || k);
           newPayload[key] = transformed;
        });
      }


      // 4. SIMULATION BYPASS
      // We check if the ORIGINAL payload contained any simulated IDs
      const containsSimulated = items.some((item: any) => 
        (item.id_slave && String(item.id_slave).includes("sim_acc_")) || 
        (item.id_master && String(item.id_master).includes("sim_acc_"))
      );
      
      if (containsSimulated) {
        console.log("[Simulation] Bypassing external settings/set for simulated accounts");
        
        // Update local state for simulated accounts so they "appear" connected to the group
        for (const item of items) {
          if (item.id_slave && String(item.id_slave).includes("sim_acc_")) {
            // If status is 0, we unfollow (clear groupid). If 1, we follow (set groupid).
            const targetGroupId = item.copier_status === 0 ? null : item.id_group;
            
            await prisma.tradeCopierAccount.update({
              where: { account_id: item.id_slave },
              data: { groupid: targetGroupId }
            }).catch(err => console.warn("Failed to update simulated account groupid:", err));
          }
        }

        return NextResponse.json({
          status: "success",
          message: "[Simulated] Configuración aplicada localmente exitosamente.",
          data: { updated: Object.keys(body.payload || {}).length }
        });
      }

      body.payload = newPayload;
    }


    const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/settings/set`, {
      method: "POST",
      headers: {
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

