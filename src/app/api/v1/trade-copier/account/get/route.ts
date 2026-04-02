import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 1. Fetch local accounts from Prisma based on role
    const isSuperAdmin = session.user.role === "superadmin";
    const userId = session.user.id;

    const localAccounts = isSuperAdmin
      ? await prisma.tradeCopierAccount.findMany({ include: { user: { select: { email: true } } } })
      : await prisma.tradeCopierAccount.findMany({ where: { userId }, include: { user: { select: { email: true } } } });

    // 2. Fetch from external API to enrich real-time data (balance, equity, state)
    let externalAccountsMap = new Map();
    try {
      const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/account/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ payload: body }),
      });

      if (externalResponse.ok) {
        const contentType = externalResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const extData = await externalResponse.json();
          if (extData.status === "success" && extData.data?.accounts) {
            extData.data.accounts.forEach((acc: any) => {
              externalAccountsMap.set(acc.account_id, acc);
            });
          }
        }
      }
    } catch (e) {
      console.warn("Could not fetch external API for enrichment:", e);
    }

    // 3. Map local accounts to the final presentation format
    const finalAccounts = localAccounts.map(localAcc => {
      const extAcc = externalAccountsMap.get(localAcc.account_id);
      return {
        account_id: localAcc.account_id,
        name: localAcc.name,
        type: localAcc.type,
        broker: localAcc.broker,
        login: localAcc.login,
        server: localAcc.server,
        environment: localAcc.environment,
        status: localAcc.status,
        groupid: localAcc.groupid || extAcc?.id_group,
        state: extAcc?.state || "CONECTADA", // fallback default
        balance: extAcc?.balance || "—",
        equity: extAcc?.equity || "—",
        ccy: extAcc?.ccy || "USD",
        lastUpdate: localAcc.updatedAt?.toISOString(),
        isOwner: localAcc.userId === session.user.id,
        ownerEmail: localAcc.user?.email,
      };
    });

    return NextResponse.json({
      status: "success",
      data: {
        accounts: finalAccounts
      }
    });

  } catch (error) {
    console.error("Get Accounts Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
