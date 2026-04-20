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

    // Fetch copying information for slave accounts
    const slaveAccountIds = accounts.filter(acc => acc.type === 1).map(acc => acc.account_id);
    const syncConfigs = await prisma.syncConfig.findMany({
      where: { slaveAccountId: { in: slaveAccountIds } },
      include: {
        user: { // This is the user who owns the SyncConfig, not necessarily the master owner
            select: { name: true }
        }
      }
    });

    // We need to find the OWNER of the master accounts listed in syncConfigs
    const masterAccountIds = syncConfigs.map(sc => sc.masterAccountId);
    const masterAccounts = await prisma.tradeCopierAccount.findMany({
      where: { account_id: { in: masterAccountIds } },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // Desencriptar contraseñas y añadir info de trading
    const decryptedAccounts = accounts.map(acc => {
      let decryptedPassword = "";
      try {
        decryptedPassword = acc.password ? decrypt(acc.password) : "";
      } catch (e) {
        decryptedPassword = acc.password || "";
      }

      let traderName = "";
      if (acc.type === 1) {
        const config = syncConfigs.find(sc => sc.slaveAccountId === acc.account_id);
        if (config) {
            const master = masterAccounts.find(ma => ma.account_id === config.masterAccountId);
            traderName = master?.user?.name || master?.user?.email || "Trader";
        }
      }

      return {
        ...acc,
        password: decryptedPassword,
        traderName // Added traderName for UI
      };
    });

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
