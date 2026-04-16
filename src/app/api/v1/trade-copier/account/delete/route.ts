import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTradeCopierHeaders } from "@/lib/trade-copier-headers";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { account_id, targetUserId } = body;

    // 1. Authorization: Verify ownership (only for personal deletions, not "unfollow")
    if (!targetUserId) {
      const dbAccount = await prisma.tradeCopierAccount.findUnique({
        where: { account_id },
        select: { userId: true }
      });

      if (!dbAccount || dbAccount.userId !== session.user.id) {
        return NextResponse.json({ status: "error", message: "Acceso denegado. No eres el propietario de esta cuenta." }, { status: 403 });
      }
    }

    // 2. Proxy to external API
    let result: any = {};
    if (account_id.startsWith("sim_acc_")) {
      result = { status: "success", message: "Account deleted simulated" };
    } else {
      // Impersonation Logic
      let headerUserId = session.user.id;
      if (targetUserId) {
        headerUserId = targetUserId;
        // Do not leak internal param
        delete body.targetUserId;
      }

      const externalHeaders = await getTradeCopierHeaders(headerUserId);

      const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/account/delete`, {
        method: "POST",
        headers: externalHeaders,
        body: JSON.stringify({ payload: body }),
      });

      const contentType = externalResponse.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        result = await externalResponse.json();
      } else {
        const text = await externalResponse.text();
        console.error("External API Delete Account Non-JSON Response:", text);
        return NextResponse.json({ 
          error: "External API Error", 
          message: "El Servidor de IT TRADE devolvió un formato inesperado al intentar eliminar la cuenta.",
          details: text.substring(0, 100)
        }, { status: externalResponse.status || 502 });
      }

      if (!externalResponse.ok || result.status !== "success") {
        return NextResponse.json(result, { status: externalResponse.status });
      }
    }

    // 3. Sync with local DB (ONLY if it's a personal account deletion, not an "unfollow")
    if (!targetUserId) {
      await prisma.tradeCopierAccount.delete({
        where: {
          account_id: account_id,
        },
      });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Delete Account Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
