import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role;

    // Fetch configs
    const configs = await prisma.modelConfig.findMany({
      where: role === "superadmin" ? {} : { userId },
      orderBy: { createdAt: "desc" },
    });

    // Fetch models (templates)
    const models = await prisma.tradingModel.findMany({
      where: role === "superadmin" ? {} : {
        OR: [
          { userId },
          { isPublic: true }
        ]
      },
      include: {
        modelConfig: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedModels = models.map((m: any) => {
      const { modelConfig, ...rest } = m;
      return {
        ...rest,
        settings: modelConfig
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        configs,
        models: mappedModels,
      },
    });
  } catch (error) {
    console.error("Get Models/Configs Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
