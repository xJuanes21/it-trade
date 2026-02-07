import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get account from Prisma
    const account = await prisma.mt5Account.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "No se encontró una cuenta vinculada para este usuario" },
        { status: 404 }
      );
    }

    // 2. Decrypt password
    let password;
    try {
      password = decrypt(account.password);
    } catch (e) {
      console.error("Decryption error:", e);
      return NextResponse.json(
        { error: "Error de seguridad al procesar las credenciales" },
        { status: 500 }
      );
    }

    // 3. Proxy to external sync API
    const externalResponse = await fetch("https://mt5.ittradew.com/api/v1/sync/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        login: Number(account.login),
        password: password,
        server: account.server,
      }),
    });

    if (!externalResponse.ok) {
      const errorData = await externalResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al sincronizar con el broker" },
        { status: externalResponse.status }
      );
    }

    const data = await externalResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
