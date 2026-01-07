import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ magic_number: string }> }) {
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

    const existing = await prisma.eaConfig.findUnique({
        where: { magicNumber: magicNumber }
    });

    if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    await prisma.eaConfig.update({
        where: { magicNumber: magicNumber },
        data: { enabled: true }
    });

    return NextResponse.json({ message: "EA enabled" });
  } catch (error) {
    console.error("Error enabling EA:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
