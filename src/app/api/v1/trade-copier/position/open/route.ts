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

    const body = await req.json().catch(() => ({}));
    const userId = session.user.id;
    const isSuperAdmin = session.user.role === "superadmin";

    // Header Impersonation and Copy Relation Logic
    let headerUserId = userId;
    let isImpersonating = false;

    if (body.targetUserId) {
      headerUserId = body.targetUserId;
      isImpersonating = true;
      delete body.targetUserId;
    }

    // Resolution for standard users fetching their own data
    if (session.user.role === "user" && !isImpersonating) {
      const copyRequest = await prisma.copyRequest.findFirst({
        where: {
          followerId: userId,
          slaveAccountId: body.account_id ? String(body.account_id) : undefined,
          status: "APPROVED"
        },
        select: { traderId: true }
      });
      if (copyRequest) headerUserId = copyRequest.traderId;
    }

    let externalHeaders;
    try {
      externalHeaders = await getTradeCopierHeaders(headerUserId);
    } catch (err: any) {
      if (err.message === "CredentialsApiConfigurationMissing") {
        return NextResponse.json({
          status: "success",
          data: {
            openPositions: [],
            totalCount: 0
          }
        });
      }
      throw err;
    }

    const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/position/open`, {
      method: "POST",
      headers: externalHeaders,
      body: JSON.stringify(body)
    });

    const contentType = externalResponse.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const result = await externalResponse.json();
      return NextResponse.json(result);
    } else {
      const text = await externalResponse.text();
      return NextResponse.json({ error: "External API Non-JSON response", details: text }, { status: 502 });
    }
  } catch (error) {
    console.error("Position Open Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
