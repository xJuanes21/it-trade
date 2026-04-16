import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTradeCopierHeaders } from "@/lib/trade-copier-headers";
import { prisma } from "@/lib/prisma";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Proxy to external API with payload wrapping and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    // Users don't have their own CredentialsApi — use a superadmin's credentials
    let externalHeaders: HeadersInit;
    try {
      externalHeaders = await getTradeCopierHeaders(session.user.id);
    } catch (err: any) {
      if (err.message === "CredentialsApiConfigurationMissing") {
        // Fallback: find a superadmin with credentials
        const superadmin = await prisma.user.findFirst({
          where: { role: "superadmin", credentialsApi: { isNot: null } },
          select: { id: true }
        } as any);

        if (!superadmin) {
          return NextResponse.json({
            status: "error",
            message: "No hay credenciales de administrador configuradas para consultar servidores."
          }, { status: 503 });
        }

        externalHeaders = await getTradeCopierHeaders(superadmin.id);
      } else {
        throw err;
      }
    }

    const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/account/get-servers-list`, {
      method: "POST",
      headers: externalHeaders,
      body: JSON.stringify({ payload: body }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = externalResponse.headers.get("content-type");
    let result;
    
    if (contentType && contentType.includes("application/json")) {
      result = await externalResponse.json();
    } else {
      const text = await externalResponse.text();
      console.error(`[Proxy] External API Servers List ERROR (${externalResponse.status}):`, text);
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
