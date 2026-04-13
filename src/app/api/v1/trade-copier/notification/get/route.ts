import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTradeCopierHeaders } from "@/lib/trade-copier-headers";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let externalHeaders;
    try {
      externalHeaders = await getTradeCopierHeaders(session.user.id);
    } catch (err: any) {
      if (err.message === "CredentialsApiConfigurationMissing") {
        return NextResponse.json({ status: "success", data: [] });
      }
      throw err;
    }

    const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/notification/get`, {
      method: "GET",
      headers: {
        ...externalHeaders,
        "Accept": "application/json"
      }
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
    console.error("Notification Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
