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
      // 1. Step 1: Get all users with trader/admin roles that have API credentials configured
      const allCredentials = await prisma.credentialsApi.findMany({
        where: {
          user: {
            OR: [
              { role: "trader" },
              { role: "superadmin" }
            ]
          }
        },
        select: {
          userId: true,
          data: true,
          user: {
            select: { name: true, email: true, role: true },
          },
        },
      });

      if (allCredentials.length === 0) {
        return NextResponse.json({
          status: "success",
          data: { reporting: [], totalCount: 0 },
        });
      }

      // 2. Step 2: Fan-out requests to external API for each credential set
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
          const ownerRole = cred.user?.role || "user";

          return reporting.map((entry: any) => ({
            ...entry,
            ownerName,
            ownerRole,
            ownerUserId: cred.userId,
            _allUserAccountsTotal: reporting.length
          }));
        })
      );

      // 3. Step 3: Aggregate (Allow multiple traders per account)
      const globalReporting: any[] = [];
      const userAccountCounts = new Map<string, number>();

      for (const result of results) {
        if (result.status !== "fulfilled") continue;
        
        const firstEntry = result.value[0];
        if (firstEntry) {
          userAccountCounts.set(firstEntry.ownerUserId, firstEntry._allUserAccountsTotal);
        }

        for (const entry of result.value) {
          // We no longer deduplicate by account_id because multiple IT TRADE users 
          // might be managing/linking the same external account and want to be ranked.
          entry.traderAccountCount = userAccountCounts.get(entry.ownerUserId) || 0;
          
          // Generate a truly unique ID for this ranking entry (User + Account)
          entry.rankingId = `${entry.ownerUserId}_${entry.account_id}`;
          
          delete entry._allUserAccountsTotal;
          globalReporting.push(entry);
        }
      }

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
      if (body.account_id) {
        // 1. Check if the user really owns this account locally
        const account = await prisma.tradeCopierAccount.findFirst({
          where: {
            account_id: String(body.account_id),
            userId: userId
          }
        });
        if (!account) {
          return NextResponse.json({ error: "No tienes permiso para ver este reporte." }, { status: 403 });
        }

        // 2. Try to get the Trader's credentials via approved copy request
        const copyRequest = await prisma.copyRequest.findFirst({
          where: {
            followerId: userId,
            slaveAccountId: String(body.account_id),
            status: "APPROVED"
          },
          select: { traderId: true }
        });

        if (copyRequest) {
          headerUserId = copyRequest.traderId;
        } else {
          // Manually associated account without CopyRequest
          // Standard user has no API credentials, so we use a SuperAdmin's credentials to fetch
          const adminWithCreds = await prisma.credentialsApi.findFirst({
            where: { user: { role: "superadmin" } },
            select: { userId: true }
          });
          if (adminWithCreds) headerUserId = adminWithCreds.userId;
        }
      } else {
        // Fetching for ALL accounts of this user.
        // The user might have multiple accounts across different traders or manual links.
        // The safest way to ensure we can pull all their metrics is to use a SuperAdmin token.
        const adminWithCreds = await prisma.credentialsApi.findFirst({
          where: { user: { role: "superadmin" } },
          select: { userId: true }
        });
        if (adminWithCreds) headerUserId = adminWithCreds.userId;
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

      // If the account is linked but we reached here, it means we might need 
      // credentials from a SuperAdmin to fetch the report, as the standard user has none.
      try {
        await getTradeCopierHeaders(headerUserId);
      } catch (err: any) {
        if (err.message === "CredentialsApiConfigurationMissing") {
          // Fallback: Find the first SuperAdmin with credentials
          const adminWithCreds = await prisma.credentialsApi.findFirst({
            where: { user: { role: "superadmin" } },
            select: { userId: true }
          });
          if (adminWithCreds) {
            headerUserId = adminWithCreds.userId;
          }
        }
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
      // FIX: use 'userId' (session user), NOT 'headerUserId' (which could be the SuperAdmin now)
      const userAccounts = await prisma.tradeCopierAccount.findMany({
        where: { userId: userId },
        select: { account_id: true }
      });

      const allowedIds = new Set(userAccounts.map((a: any) => String(a.account_id)));
      
      result.data.reporting = result.data.reporting.filter((rep: any) =>
        allowedIds.has(String(rep.account_id))
      );
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
