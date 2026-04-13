import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("targetUserId");
    const role = session.user.role;

    // Determination of who we are looking up
    let lookUpId = session.user.id;
    if (targetUserId && role === "superadmin") {
      lookUpId = targetUserId;
    }

    const credentials = await prisma.credentialsApi.findUnique({
      where: { userId: lookUpId },
    });

    return NextResponse.json({
      hasCredentials: !!credentials,
      updatedAt: credentials?.updatedAt || null,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "superadmin" && role !== "trader") {
      return NextResponse.json({ error: "No tienes permisos" }, { status: 403 });
    }

    const { email, password, targetUserId } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }

    // Determine target user
    let finalTargetId = session.user.id;
    if (targetUserId && role === "superadmin") {
      finalTargetId = targetUserId;
    }

    // Encrypt the JSON payload exactly how the backend expects it.
    const payloadBuffer = JSON.stringify({ 
      usuario: email, 
      password: password 
    });
    let encryptedData = "";

    try {
      encryptedData = encrypt(payloadBuffer);
    } catch (encError) {
      console.error("Encryption error:", encError);
      return NextResponse.json({ error: "Error interno al encriptar credenciales" }, { status: 500 });
    }

    // Use upsert to create or update the credentials for the user
    await prisma.credentialsApi.upsert({
      where: {
        userId: finalTargetId,
      },
      update: {
        data: encryptedData,
      },
      create: {
        userId: finalTargetId,
        data: encryptedData,
      },
    });

    return NextResponse.json({ status: "success", message: "Credenciales encriptadas guardadas correctamente" });

  } catch (error: any) {
    console.error("Save credentials error:", error);
    return NextResponse.json(
      { error: "Error al guardar en la base de datos" },
      { status: 500 }
    );
  }
}

