import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

/**
 * Endpoint to manually link an account from the external API to a local IT Trade user.
 * This is used for traceability and to remove the "Sin relación con IT Trade" label.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { account, targetUserId } = await req.json();

    if (!account?.account_id || !targetUserId) {
      return NextResponse.json(
        { error: "Faltan datos de la cuenta o el usuario de destino." },
        { status: 400 }
      );
    }

    console.log(`[API/Account/Link] Linking account ${account.account_id} to user ${targetUserId}`);

    // Encrypt password if present to maintain consistency with local accounts GET route
    const passwordToStore = account.password && account.password !== "****" 
      ? encrypt(account.password) 
      : (account.password || "****");

    // Create or update the local relation for traceability
    const result = await prisma.tradeCopierAccount.upsert({
      where: { account_id: String(account.account_id) },
      update: {
        userId: targetUserId,
        name: account.name || account.account_name || "Cuenta MT5",
        broker: account.broker || "mt5",
        login: String(account.login),
        password: passwordToStore,
        server: account.server || "",
        type: Number(account.type),
        ccy: account.ccy || "USD",
        balance: account.balance ? parseFloat(account.balance) : 0,
        equity: account.equity ? parseFloat(account.equity) : 0,
        state: account.state || "CONNECTED",
        status: Number(account.status) || 1,
      },
      create: {
        account_id: String(account.account_id),
        userId: targetUserId,
        name: account.name || account.account_name || "Cuenta MT5",
        broker: account.broker || "mt5",
        login: String(account.login),
        password: passwordToStore,
        server: account.server || "",
        type: Number(account.type),
        ccy: account.ccy || "USD",
        balance: account.balance ? parseFloat(account.balance) : 0,
        equity: account.equity ? parseFloat(account.equity) : 0,
        state: account.state || "CONNECTED",
        status: Number(account.status) || 1,
      },
    });

    return NextResponse.json({ 
      status: "success", 
      message: "Cuenta vinculada correctamente.",
      data: result 
    });

  } catch (error) {
    console.error("Link Account Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
