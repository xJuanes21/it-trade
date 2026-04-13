import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTradeCopierHeaders } from "@/lib/trade-copier-headers";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    let externalHeaders;
    try {
      externalHeaders = await getTradeCopierHeaders(session.user.id);
    } catch (err: any) {
      if (err.message === "CredentialsApiConfigurationMissing") {
        return NextResponse.json({ 
          error: "Configuración Faltante", 
          message: "Debes configurar tus credenciales de API en el módulo de Configuraciones primero." 
        }, { status: 400 });
      }
      throw err;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/template/add`, {
      method: "POST",
      headers: { 
        ...externalHeaders,
        "Content-Type": "application/json", 
        "Accept": "application/json" 
      },
      body: JSON.stringify({ payload: body }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const result = await externalResponse.json();
    return NextResponse.json(result, { status: externalResponse.status });
  } catch (error) {
    console.error("Template Add Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
