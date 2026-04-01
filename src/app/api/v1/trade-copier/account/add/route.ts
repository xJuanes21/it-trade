import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 1. Check Account Limit
    const userId = session.user.id;
    const limit = parseInt(process.env.COPY_TRADER_LIMIT || "1", 10);

    const currentCount = await prisma.tradeCopierAccount.count({
      where: { userId }
    });

    if (currentCount >= limit) {
      return NextResponse.json({
        status: "error",
        message: `Has alcanzado el límite de ${limit} cuenta(s)  permitidas para tu suscripción.`
      }, { status: 403 });
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
      // 2. Proxy to external API
      const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/account/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(body),
      });

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

      accountId = result?.data?.account?.account_id || result?.data?.account_id;

      if (!accountId) {
        console.error("External API Success but missing Account ID:", JSON.stringify(result, null, 2));
        return NextResponse.json({
          status: "error",
          message: "El Servidor de IT TRADE no devolvió el ID de la cuenta creada.",
          debug: result
        }, { status: 502 });
      }
    }

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
    console.error("Add Account Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
