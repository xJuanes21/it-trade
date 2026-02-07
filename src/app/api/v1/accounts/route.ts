import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
