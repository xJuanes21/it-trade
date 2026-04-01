import { NextResponse } from "next/server";
import { auth } from "@/auth";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Proxy to external API
    const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/account/get-servers-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body),
    });

    const contentType = externalResponse.headers.get("content-type");
    let result;
    
    if (contentType && contentType.includes("application/json")) {
      result = await externalResponse.json();
    } else {
      const text = await externalResponse.text();
      console.error("External API Servers List Non-JSON Response:", text);
      return NextResponse.json({ 
        error: "External API Error", 
        message: "El Servidor de IT TRADE devolvió un formato inesperado al solicitar la lista de servidores.",
        details: text.substring(0, 100)
      }, { status: externalResponse.status || 502 });
    }

    return NextResponse.json(result, { status: externalResponse.status });

  } catch (error) {
    console.error("Get Servers Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
