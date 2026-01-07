import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ magic_number: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { magic_number } = await params;
    const magicNumber = parseInt(magic_number);

    if (isNaN(magicNumber)) {
        return NextResponse.json({ message: "Invalid magic number" }, { status: 400 });
    }

    const config = await prisma.eaConfig.findUnique({
      where: { magicNumber: magicNumber },
    });

    if (!config || config.userId !== session.user.id) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    // Mock status for now, as we don't have a live connection to MT5
    // In a real scenario, this would query Redis or an external service
    const status = {
        ea_name: config.eaName,
        magic_number: config.magicNumber,
        is_running: config.enabled,
        active_trades: 0, // Placeholder
        total_profit: 0, // Placeholder
        last_update: new Date().toISOString()
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error getting EA Status:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
