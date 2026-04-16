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

    // 1. Fetch local accounts from Prisma to identify owners
    const isSuperAdmin = session.user.role === "superadmin";
    const isTrader = session.user.role === "trader";
    const canSeeAll = isSuperAdmin || isTrader;
    const userId = session.user.id;

    // Header Impersonation Logic
    let headerUserId = userId;
    // Allow any authenticated user to request data for another user (for the Directory module)
    if (body.targetUserId) {
      headerUserId = body.targetUserId;
      delete body.targetUserId; // Do not leak this internal param to external API
    }

    const localAccounts = await prisma.tradeCopierAccount.findMany({ 
      include: { user: { select: { email: true } } } 
    });
    const localAccountsMap = new Map();
    localAccounts.forEach(acc => {
      if (acc.account_id) localAccountsMap.set(String(acc.account_id), acc);
      if (acc.login) localAccountsMap.set(String(acc.login), acc);
    });

    console.log(`[API/Account/Get] Local accounts found: ${localAccounts.length}`);
    console.log(`[API/Account/Get] Map keys:`, Array.from(localAccountsMap.keys()));

    let externalHeaders;
    try {
      externalHeaders = await getTradeCopierHeaders(headerUserId);
    } catch (err: any) {
      if (err.message === "CredentialsApiConfigurationMissing") {
        return NextResponse.json({
          status: "success",
          data: { accounts: [], totalCount: 0 }
        });
      }
      throw err;
    }

    // 2. Fetch from external API as the SOURCE OF TRUTH
    let externalAccounts: any[] = [];
    try {
      const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/account/get`, {
        method: "POST",
        headers: externalHeaders,
        body: JSON.stringify({ payload: body }),
      });

      if (externalResponse.ok) {
        const contentType = externalResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const extData = await externalResponse.json();
          if (extData.status === "success" && extData.data?.accounts) {
            externalAccounts = extData.data.accounts;
          }
        }
      } else {
         const errorRaw = await externalResponse.text();
         console.error("External API returned error:", errorRaw);
      }
    } catch (e) {
      console.warn("Could not fetch external API:", e);
    }

    // 3. Map external accounts and mix local identifiers
    let finalAccounts = externalAccounts.map(extAcc => {
      // Robust matching: Try account_id first, then login as fallback
      const extId = String(extAcc.account_id || "");
      const extLogin = String(extAcc.login || "");
      
      const localMatch = localAccountsMap.get(extId) || localAccountsMap.get(extLogin);
      
      return {
        ...extAcc,
        // Override state/balance safely
        state: extAcc.state || "UNKNOWN",
        balance: extAcc.balance || 0,
        equity: extAcc.equity || 0,
        ccy: extAcc.ccy || "USD",
        // Map ownership data
        isOwner: localMatch ? localMatch.userId === userId : false,
        ownerEmail: localMatch?.user?.email,
        ownerName: localMatch?.user?.name, // Added for extra context
        isLinked: !!localMatch, // Added to help UI logic
      };
    });

    // 4. Temporarily disabled role based filter. 
    // The raw "get a pelo" array will be returned directly, and the future Header implementation will manage session filtering natively.
    // if (!canSeeAll) {
    //   finalAccounts = finalAccounts.filter(acc => acc.isOwner);
    // }

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
