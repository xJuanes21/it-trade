import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { getTradeCopierHeaders } from "@/lib/trade-copier-headers";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { account_id } = body;
    const isSuperAdmin = session.user.role === "superadmin";
    const isTrader = session.user.role === "trader";

    // 1. Authorization: Verify the account belongs to the current user OR privileged role
    let dbAccount = await prisma.tradeCopierAccount.findUnique({
      where: { account_id },
      select: { userId: true }
    });

    const isOwner = dbAccount?.userId === session.user.id;
    
    // If not owner/admin/trader and no targetUserId, block
    if (!isOwner && !isSuperAdmin && !isTrader && (!body.targetUserId || body.targetUserId === "me")) {
      return NextResponse.json({ status: "error", message: "Acceso denegado. No eres el propietario de esta cuenta." }, { status: 403 });
    }

    // 2. Proxy to external API
    let result: any = {};
    if (account_id.startsWith("sim_acc_")) {
      console.log(`[Simulación] Bypass API Externa para actualizar cuenta ${account_id}`);
      result = { status: "success", message: "Account updated simulated" };
    } else {
      // Impersonation logic for headers: prioritize targetUserId, then dbOwner, then session
      let headerUserId = session.user.id;
      if (body.targetUserId && body.targetUserId !== "me") {
        headerUserId = body.targetUserId;
      } else if (dbAccount?.userId) {
        headerUserId = dbAccount.userId;
      }

      const externalHeaders = await getTradeCopierHeaders(headerUserId);
      
      const payload = { ...body };
      delete payload.targetUserId;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/account/update`, {
        method: "POST",
        headers: externalHeaders,
        body: JSON.stringify({ payload }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const contentType = externalResponse.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await externalResponse.json();
      } else {
        const text = await externalResponse.text();
        return NextResponse.json({ error: "External API Error", message: "Unexpected response format" }, { status: 502 });
      }

      if (!externalResponse.ok || result.status !== "success") {
        return NextResponse.json(result, { status: externalResponse.status });
      }
    }

    // 3. Sync with local DB IF it exists (Only update provided fields)
    if (dbAccount) {
      const updateData: any = {};
      
      if (body.name !== undefined) updateData.name = body.name;
      if (body.type !== undefined) updateData.type = Number(body.type);
      if (body.broker !== undefined) updateData.broker = body.broker;
      if (body.login !== undefined) updateData.login = body.login;
      if (body.password !== undefined) updateData.password = encrypt(body.password);
      if (body.server !== undefined) updateData.server = body.server;
      if (body.environment !== undefined) updateData.environment = body.environment;
      if (body.status !== undefined) updateData.status = Number(body.status);
      if (body.group !== undefined) updateData.groupid = body.group;
      if (body.subscription !== undefined) updateData.subscription_key = body.subscription;
      if (body.ccy !== undefined) updateData.ccy = body.ccy;
      if (body.balance !== undefined) updateData.balance = Number(body.balance);
      if (body.equity !== undefined) updateData.equity = Number(body.equity);

      if (Object.keys(updateData).length > 0) {
        await prisma.tradeCopierAccount.update({
          where: { account_id },
          data: updateData,
        });
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Update Account Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
