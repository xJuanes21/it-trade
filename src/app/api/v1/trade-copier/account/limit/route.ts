import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/v1/trade-copier/account/limit
 * Returns the account limit and current count for the authenticated user.
 * Used by the frontend to disable the "Vincular Cuenta" button when the limit is reached.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const limit = parseInt(process.env.COPY_TRADER_LIMIT || "1", 10);

    const current = await prisma.tradeCopierAccount.count({
      where: { userId },
    });

    return NextResponse.json({
      status: "success",
      data: { limit, current },
    });
  } catch (error) {
    console.error("Account Limit Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
