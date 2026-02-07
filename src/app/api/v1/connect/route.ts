import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { z } from "zod";

const connectSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
  server: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = connectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ detail: result.error.issues }, { status: 422 });
    }

    const { login, password, server } = result.data;

    // 1. PROXY: Validate against external API
    const externalResponse = await fetch("https://mt5.ittradew.com/api/v1/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ login, password, server }),
    });

    if (!externalResponse.ok) {
      const errorData = await externalResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to connect to MT5 Broker" },
        { status: externalResponse.status }
      );
    }

    const externalData = await externalResponse.json();

    // 2. BACKUP: Encrypt and Save locally
    const encryptedPassword = encrypt(password);

    const account = await prisma.mt5Account.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        login,
        password: encryptedPassword, // Store encrypted
        server,
      },
      create: {
        userId: session.user.id,
        login,
        password: encryptedPassword, // Store encrypted
        server,
      },
    });

    return NextResponse.json({ 
      success: true, 
      accountId: account.id,
      externalData // Return external data just in case
    });

  } catch (error) {
    console.error("Connect error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
