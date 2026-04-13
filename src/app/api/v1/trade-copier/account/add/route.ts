import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { getTradeCopierHeaders } from "@/lib/trade-copier-headers";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Extract impersonation target BEFORE any branching
    const targetUserId = body.targetUserId;
    let headerUserId = session.user.id;
    if (targetUserId) {
      headerUserId = targetUserId;
      delete body.targetUserId; // Do not leak to external API payload
    }

    // 1.5 SIMULACIÓN DE PRUEBAS LOCALES
    const SIMULATED_LOGINS = ["77889900", "11223344", "999999", "12345"];
    let accountId = "";
    let result: any = {};

    if (SIMULATED_LOGINS.includes(body.login)) {
      console.log(`[Simulación] Bypass API Externa para login ${body.login}`);
      accountId = `sim_acc_${body.login}_${Date.now()}`;
      result = { status: "success", data: { account: { account_id: accountId } } };
    } else {
      const externalHeaders = await getTradeCopierHeaders(headerUserId);

      // 2. Proxy to external API with increased timeout (60s)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/account/add`, {
        method: "POST",
        headers: externalHeaders,
        body: JSON.stringify({ payload: body }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const contentType = externalResponse.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        result = await externalResponse.json();
      } else {
        const text = await externalResponse.text();
        console.error("External API Add Account Non-JSON Response:", text);
        return NextResponse.json({
          error: "External API Error",
          message: "El Servidor de IT TRADE devolvió un formato inesperado al intentar agregar la cuenta.",
          details: text.substring(0, 100)
        }, { status: externalResponse.status || 502 });
      }

      if (!externalResponse.ok || result.status !== "success") {
        return NextResponse.json(result, { status: externalResponse.status });
      }

      // Edge case: API returns status:"success" but data contains an error code (e.g. subscription limit)
      if (result.data?.code || result.data?.error) {
        return NextResponse.json({
          status: "error",
          message: result.data.error || "Error del servidor externo.",
          code: result.data.code
        }, { status: 403 });
      }

      // Robust ID extraction from multiple known formats
      accountId = result?.data?.account?.account_id || 
                  result?.data?.account_id || 
                  result?.account_id || 
                  result?.data?.id || 
                  result?.id;

      if (!accountId) {
        console.error("External API Success but missing Account ID. Full Response:", JSON.stringify(result, null, 2));
        return NextResponse.json({
          status: "error",
          message: "El Servidor de IT TRADE no devolvió el ID de la cuenta creada.",
          debug: result
        }, { status: 502 });
      }
    }

    // For impersonation (copy trader), we only proxied to the external API.
    // Do NOT create/update local DB records — the account already lives locally for the user.
    const isImpersonated = headerUserId !== session.user.id;
    if (isImpersonated) {
      return NextResponse.json({
        status: "success",
        data: { account: { account_id: accountId } }
      });
    }

    // --- Personal account flow: sync with local DB ---

    // Check if another user already has this account linked
    const existingLink = await prisma.tradeCopierAccount.findUnique({
      where: { account_id: accountId },
      select: { userId: true }
    });

    if (existingLink && existingLink.userId !== session.user.id) {
      return NextResponse.json({
        status: "error",
        message: "Esta cuenta ya está vinculada a otro usuario en el sistema."
      }, { status: 403 });
    }

    // Prepare local variables
    const mt5Account = await prisma.mt5Account.findFirst({ where: { login: body.login } });
    const encryptedPassword = body.password ? encrypt(body.password) : "";


    const tradeCopierAccount = await prisma.tradeCopierAccount.upsert({
      where: {
        account_id: accountId,
      },
      update: {
        name: body.name,
        type: Number(body.type),
        broker: body.broker,
        login: body.login,
        password: encryptedPassword,
        server: body.server,
        environment: body.environment,
        status: body.status,
        groupid: body.group,
        subscription_key: body.subscription,
        mt5AccountId: mt5Account?.id || null,
      },
      create: {
        userId: session.user.id,
        account_id: accountId,
        name: body.name,
        type: Number(body.type),
        broker: body.broker,
        login: body.login,
        password: encryptedPassword,
        server: body.server,
        environment: body.environment,
        status: body.status,
        groupid: body.group,
        subscription_key: body.subscription,
        mt5AccountId: mt5Account?.id || null,
      },
    });

    return NextResponse.json({
      status: "success",
      data: {
        account: tradeCopierAccount
      }
    });

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Timeout Error", message: "El Servidor de IT TRADE tardó demasiado en responder (60s). Esto suele pasar si el broker externo es lento." },
        { status: 504 }
      );
    }

    console.error("Add Account Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Error al intentar conectar con el Servidor IT TRADE.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
