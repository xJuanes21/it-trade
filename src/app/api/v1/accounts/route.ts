import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decrypt, encrypt } from "@/lib/encryption";

/**
 * GET /api/v1/accounts
 * Returns all local TradeCopierAccount records for the current user.
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.tradeCopierAccount.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Desencriptar contraseñas para el formulario
    const decryptedAccounts = accounts.map(acc => ({
      ...acc,
      password: acc.password ? decrypt(acc.password) : "",
    }));

    return NextResponse.json({
      status: "success",
      data: {
        accounts: decryptedAccounts,
      },
    });
  } catch (error) {
    console.error("Get local accounts error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/accounts
 * Registers a user's broker account ONLY in the local database (Prisma).
 * NO external API call is made. This is for `user` role accounts.
 * The external API is only contacted later during the "Copy Trader" flow.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.login || !body.broker || !body.server || !body.name) {
      return NextResponse.json({
        status: "error",
        message: "Faltan campos obligatorios: login, broker, server, name."
      }, { status: 400 });
    }

    // Check account limit
    const limitRes = await fetch(`${req.url.replace("/accounts", "/trade-copier/account/limit")}`, {
      headers: { cookie: req.headers.get("cookie") || "" }
    }).catch(() => null);

    // Generate a local-only account_id (no external API involved)
    const accountId = `local_${session.user.id}_${body.login}_${Date.now()}`;
    const encryptedPassword = body.password ? encrypt(body.password) : "";

    // Check if this login already exists for this user
    const existingAccount = await prisma.tradeCopierAccount.findFirst({
      where: {
        userId: session.user.id,
        login: body.login,
      }
    });

    if (existingAccount) {
      // Update existing
      const updated = await prisma.tradeCopierAccount.update({
        where: { id: existingAccount.id },
        data: {
          name: body.name,
          broker: body.broker,
          login: body.login,
          password: encryptedPassword,
          server: body.server,
          environment: body.environment || "Detect",
          status: body.status ?? 1,
          type: Number(body.type ?? 1),
          groupid: body.group || null,
        },
      });

      return NextResponse.json({
        status: "success",
        data: { account: updated }
      });
    }

    // Create new local account
    const newAccount = await prisma.tradeCopierAccount.create({
      data: {
        userId: session.user.id,
        account_id: accountId,
        name: body.name,
        type: Number(body.type ?? 1), // Users default to SLAVE
        broker: body.broker,
        login: body.login,
        password: encryptedPassword,
        server: body.server,
        environment: body.environment || "Detect",
        status: body.status ?? 1,
        groupid: body.group || null,
      },
    });

    return NextResponse.json({
      status: "success",
      data: { account: newAccount }
    });

  } catch (error) {
    console.error("Register local account error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the account associated with the user
    // Since we currently enforce 1 account per user (upsert), we verify userId
    await prisma.mt5Account.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Account disconnected" });

  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
