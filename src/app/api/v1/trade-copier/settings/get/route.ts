import { NextResponse } from "next/server";
import { auth } from "@/auth";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

/**
 * POST /api/v1/trade-copier/settings/get
 * Proxies a getSettings request to the external Trade Copier API.
 * Accepts optional filter: { payload: { id_slave?, id_master?, id_group? } }
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/settings/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    const contentType = externalResponse.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const result = await externalResponse.json();
      return NextResponse.json(result, { status: externalResponse.status });
    }

    const text = await externalResponse.text();
    console.error("Settings Get - Non-JSON Response:", text);
    return NextResponse.json(
      {
        error: "External API Error",
        message: "El Servidor de IT TRADE devolvió un formato inesperado al consultar parámetros.",
        details: text.substring(0, 100),
      },
      { status: externalResponse.status || 502 }
    );
  } catch (error) {
    console.error("Settings Get Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
