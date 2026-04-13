import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTradeCopierHeaders } from "@/lib/trade-copier-headers";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

/**
 * Proxy to get reporting data from Trade Copier
 * Enforces security by checking account ownership in the local database.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const userId = session.user.id;
    const isSuperAdmin = session.user.role === "superadmin";

    // Header Impersonation Logic
    let headerUserId = userId;
    let isImpersonating = false;

    if (body.targetUserId) {
      headerUserId = body.targetUserId;
      isImpersonating = true;
      delete body.targetUserId; // Do not leak this internal param to external API
    }

    // 1. Ownership check: Only if not impersonating and account_id is provided
    if (body.account_id && !isSuperAdmin && !isImpersonating) {
      // @ts-ignore
      const account = await (prisma as any).tradeCopierAccount.findFirst({
        where: {
          account_id: body.account_id,
          userId: userId
        }
      });

      if (!account) {
        return NextResponse.json({ error: "Forbidden: Account not found or unauthorized" }, { status: 403 });
      }
    }

    let externalHeaders;
    try {
      externalHeaders = await getTradeCopierHeaders(headerUserId);
    } catch (err: any) {
      if (err.message === "CredentialsApiConfigurationMissing") {
        return NextResponse.json({
          status: "success",
          data: {
            reporting: [],
            totalCount: 0
          }
        });
      }
      throw err;
    }

    // 2. Proxy to external API
    // Removing "payload" wrapper as per latest API observations
    const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/reporting/get`, {
      method: "POST",
      headers: externalHeaders,
      body: JSON.stringify(body),
    });

    const contentType = externalResponse.headers.get("content-type");
    let result;
    
    if (contentType && contentType.includes("application/json")) {
      result = await externalResponse.json();
    } else {
      const text = await externalResponse.text();
      console.error("External API Reporting Non-JSON Response:", text);
      return NextResponse.json({ 
        error: "External API Error", 
        message: "El Servidor de IT TRADE devolvió un formato inesperado al solicitar los reportes.",
        details: text.substring(0, 100)
      }, { status: externalResponse.status || 502 });
    }

    if (!externalResponse.ok || result.status !== "success") {
      return NextResponse.json(result, { status: externalResponse.status });
    }

    // 3. Post-filtering if no specific account_id was requested (to ensure only user's accounts are returned)
    // BYPASS if 'global' flag is present to allow Global Ranking views
    if (!body.account_id && !body.global && result.data && result.data.reporting) {
      // @ts-ignore
      const userAccounts = await (prisma as any).tradeCopierAccount.findMany({
        where: { userId },
        select: { account_id: true }
      });
      
      const allowedIds = new Set(userAccounts.map((a: any) => String(a.account_id)));
      const initialCount = result.data.reporting.length;
      
      result.data.reporting = result.data.reporting.filter((rep: any) => 
        allowedIds.has(String(rep.account_id))
      );
      
      console.log(`[Reporting Proxy] Filtered ${initialCount} -> ${result.data.reporting.length} accounts for user ${userId}`);
    } else if (body.global) {
      console.log(`[Reporting Proxy] Global mode requested by user ${userId}. Returning all ${result.data?.reporting?.length || 0} accounts.`);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Reporting Get Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
