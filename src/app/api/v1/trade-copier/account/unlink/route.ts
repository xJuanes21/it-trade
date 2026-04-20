import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint to unlink an account from an IT Trade user.
 * This removes the record from TradeCopierAccount, reverting it to an "Unlinked" state.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { account_id } = await req.json();

    if (!account_id) {
      return NextResponse.json(
        { error: "Falta el ID de la cuenta para desvincular." },
        { status: 400 }
      );
    }

    // Delete the local relation
    await prisma.tradeCopierAccount.delete({
      where: { account_id: String(account_id) },
    });

    return NextResponse.json({ 
      status: "success", 
      message: "Cuenta desvinculada correctamente."
    });

  } catch (error) {
    console.error("Unlink Account Error:", error);
    
    // Handle case where record already doesn't exist
    if ((error as any).code === 'P2025') {
       return NextResponse.json({ 
        status: "success", 
        message: "La cuenta ya estaba desvinculada."
      });
    }

    return NextResponse.json(
      { error: "Error interno al desvincular la cuenta", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
