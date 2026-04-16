import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTradeCopierHeaders } from "@/lib/trade-copier-headers";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

/**
 * Helper: Fetch reporting from the external Trade Copier API using a specific
 * set of headers (credentials). Returns the parsed reporting array or an empty array on failure.
 */
async function fetchExternalReporting(
  headers: HeadersInit,
  payload: Record<string, unknown> = {}
): Promise<any[]> {
  try {
    const res = await fetch(
      `${EXTERNAL_BASE_URL}/api/v1/trade-copier/reporting/get`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    const ct = res.headers.get("content-type");
    if (!ct || !ct.includes("application/json")) return [];

    const json = await res.json();
    if (!res.ok || json.status !== "success") return [];

    return json.data?.reporting ?? [];
  } catch (err) {
    console.error("[Global Reporting] External fetch failed:", err);
    return [];
  }
}

/**
 * Proxy to get reporting data from Trade Copier
 * Enforces security by checking account ownership in the local database.
 *
 * When `body.global === true` the route aggregates reporting data across ALL
 * users who have stored `CredentialsApi`, tagging each entry with
 * `ownerName` and `ownerUserId` so the frontend can display the trader's name.
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

    // ═══════════════════════════════════════════════════════════════
    // GLOBAL RANKING MODE — aggregate across every CredentialsApi
    // ═══════════════════════════════════════════════════════════════
    if (body.global) {
      // 1. Retrieve all stored credentials — EXCLUDING SuperAdmins
      const allCredentials = await prisma.credentialsApi.findMany({
        where: {
          user: {
            role: { not: "superadmin" }
          }
        },
        select: {
          userId: true,
          data: true,
          user: {
            select: { name: true, email: true },
          },
        },
      });

      if (allCredentials.length === 0) {
        return NextResponse.json({
          status: "success",
          data: { reporting: [], totalCount: 0 },
        });
      }

      // 2. Fan-out
      const results = await Promise.allSettled(
        allCredentials.map(async (cred) => {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Accept: "application/json",
            "CP-Data-Type": cred.data,
          };

          const reporting = await fetchExternalReporting(headers, {});
          const ownerName =
            cred.user?.name || cred.user?.email || `User ${cred.userId}`;

          return reporting.map((entry: any) => ({
            ...entry,
            ownerName,
            ownerUserId: cred.userId,
            _allUserAccountsTotal: reporting.length // Store the total count for this user
          }));
        })
      );

      // 3. Flatten fulfilled results
      const seen = new Set<string>();
      const globalReporting: any[] = [];
      const userAccountCounts = new Map<string, number>();

      for (const result of results) {
        if (result.status !== "fulfilled") continue;
        
        // Record the total account count for this user (once)
        const firstEntry = result.value[0];
        if (firstEntry) {
          userAccountCounts.set(firstEntry.ownerUserId, firstEntry._allUserAccountsTotal);
        }

        for (const entry of result.value) {
          const key = String(entry.account_id);
          if (!seen.has(key)) {
            seen.add(key);
            // Append the total count to every account entry for the frontend to use
            entry.traderAccountCount = userAccountCounts.get(entry.ownerUserId) || 0;
            delete entry._allUserAccountsTotal; // Clean up temp property
            globalReporting.push(entry);
          }
        }
      }

      console.log(
        `[Reporting Proxy] Global mode: aggregated ${globalReporting.length} unique accounts from ${allCredentials.length} credential sets for user ${userId}`
      );

      return NextResponse.json({
        status: "success",
        data: {
          reporting: globalReporting,
          totalCount: globalReporting.length,
        },
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // STANDARD (per-user) MODE — proxy a single credential set
    // ═══════════════════════════════════════════════════════════════

    // Header Impersonation Logic
    let headerUserId = userId;
    let isImpersonating = false;

    if (body.targetUserId) {
      headerUserId = body.targetUserId;
      isImpersonating = true;
      delete body.targetUserId; // Do not leak this internal param to external API
    }

    // 1. Role and Access resolution
    const isTrader = session.user.role === "trader";
    const isStandardUser = session.user.role === "user";

    // 2. Ownership check and Header resolution for standard users
    if (isStandardUser && !isImpersonating) {
      // Find if this user has an APPROVED copy request for this account
      const copyRequest = await prisma.copyRequest.findFirst({
        where: {
          followerId: userId,
          slaveAccountId: body.account_id ? String(body.account_id) : undefined,
          status: "APPROVED"
        },
        select: { traderId: true }
      });

      if (copyRequest) {
        // Use the trader's credentials to fetch the report for the user's slave account
        headerUserId = copyRequest.traderId;
      } else {
        // Falling back to own credentials if any, but regular users usually have none
        // If they have a manually linked account but no copy request, 
        // they might still need a way to see reports. 
        // For now, if no copy request, we check local ownership strictly.
        if (body.account_id) {
          const account = await prisma.tradeCopierAccount.findFirst({
            where: {
              account_id: String(body.account_id),
              userId: userId
            }
          });
          if (!account) {
            return NextResponse.json({ error: "No tienes permiso para ver este reporte o no hay una relación de copia aprobada." }, { status: 403 });
          }
        }
      }
    } else if (isTrader && !isImpersonating && body.account_id) {
      // For Traders looking at their own stuff, we allow it if we can find the account in the system
      // or if they have valid headers (External API check is the ultimate barrier).
      // We don't block with 403 here because the External API uses their specific CP-Data-Type.
    } else if (!isSuperAdmin && !isImpersonating && body.account_id) {
      // Catch-all strict check for other roles
      const account = await prisma.tradeCopierAccount.findFirst({
        where: {
          account_id: String(body.account_id),
          userId: userId
        }
      });
      if (!account) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
    }

    let externalHeaders;
    try {
      externalHeaders = await getTradeCopierHeaders(headerUserId);
    } catch (err: any) {
      if (err.message === "CredentialsApiConfigurationMissing") {
        // If it's a standard user and we still don't have credentials after lookup,
        // it means they have no approved copy relationship that provides them.
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

    // 3. Proxy to external API
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

    // 3. Post-filtering: ensure only the user's own accounts are returned
    // BUT: Bypass this for SuperAdmins and Traders as they are trusted or limited by their own credentials session
    const canSeeAllLocal = isSuperAdmin || isTrader;

    if (!body.account_id && result.data && result.data.reporting && !canSeeAllLocal) {
      // @ts-ignore
      const userAccounts = await (prisma as any).tradeCopierAccount.findMany({
        where: { userId: headerUserId },
        select: { account_id: true }
      });

      const allowedIds = new Set(userAccounts.map((a: any) => String(a.account_id)));
      const initialCount = result.data.reporting.length;

      result.data.reporting = result.data.reporting.filter((rep: any) =>
        allowedIds.has(String(rep.account_id))
      );

      console.log(`[Reporting Proxy] Filtered ${initialCount} -> ${result.data.reporting.length} accounts for target user ${headerUserId}`);
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
