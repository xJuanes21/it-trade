import { NextResponse } from "next/server";
import { auth } from "@/auth";
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

    // Header Impersonation Logic
    let headerUserId = userId;
    if (isSuperAdmin && body.targetUserId) {
      headerUserId = body.targetUserId;
      delete body.targetUserId;
    }

    let externalHeaders;
    try {
      externalHeaders = await getTradeCopierHeaders(headerUserId);
    } catch (err: any) {
      if (err.message === "CredentialsApiConfigurationMissing") {
        return NextResponse.json({
          status: "success",
          data: {
            closedPositions: [],
            totalCount: 0
          }
        });
      }
      throw err;
    }

    const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/position/closed`, {
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
    console.error("Position Closed Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
