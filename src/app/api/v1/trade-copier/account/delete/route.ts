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

    // 1. Authorization & Role Check
    const isSuperAdmin = session.user.role === "superadmin";
    const isTrader = session.user.role === "trader";
    const canDeleteImmediately = isSuperAdmin || isTrader;

    const dbAccount = await prisma.tradeCopierAccount.findUnique({
      where: { account_id },
      include: { user: true }
    });

    if (!dbAccount) {
      return NextResponse.json({ status: "error", message: "Cuenta no encontrada." }, { status: 404 });
    }

    // Access check: Admin can delete anything. User/Trader can only delete their own.
    if (!isSuperAdmin && dbAccount.userId !== session.user.id) {
       return NextResponse.json({ status: "error", message: "No tienes permiso para eliminar esta cuenta." }, { status: 403 });
    }

    // 2. Immediate Deletion (Simulated, Admin, or Unlinked User account)
    let result: any = {};
    if (account_id.startsWith("sim_acc_")) {
      result = { status: "success", message: "Cuenta simulada eliminada localmente." };
    } else if (session.user.role === "user") {
      // Standard users just want to unlink the account locally so they don't see it anymore.
      // They don't have CP-Data-Type credentials to invoke external deletion anyway.
      result = { status: "success", message: "Cuenta desvinculada localmente." };
    } else {
      let headerUserId = session.user.id;
      if (targetUserId && isSuperAdmin) {
        headerUserId = targetUserId;
      }

      const externalHeaders = await getTradeCopierHeaders(headerUserId);

      const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/account/delete`, {
        method: "POST",
        headers: externalHeaders,
        body: JSON.stringify({ payload: { account_id } }),
      });

      const contentType = externalResponse.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await externalResponse.json();
      } else {
        const text = await externalResponse.text();
        return NextResponse.json({ error: "External API Error", message: text.substring(0, 100) }, { status: 502 });
      }

      if (!externalResponse.ok || result.status !== "success") {
        // If it's 404 or "not found" on server, we still allow local deletion to clean up
        if (externalResponse.status !== 404) {
          return NextResponse.json(result, { status: externalResponse.status });
        }
      }
    }

    // 4. Sync with local DB
    await prisma.tradeCopierAccount.delete({
      where: { account_id: account_id },
    });

    // Also clean up SyncConfigs if any
    await prisma.syncConfig.deleteMany({
       where: { slaveAccountId: account_id }
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Delete Account Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
