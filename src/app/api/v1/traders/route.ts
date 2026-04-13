import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const hasCredentials = searchParams.get("hasCredentials") === "true";

    console.log(`[API/Traders] Fetching - hasCredentials: ${hasCredentials}, role: ${session.user.role}`);

    // Filtros: Para el Directorio público solo Traders/Admins con credenciales.
    // Pero si es el SuperAdmin pidiendo la lista de gestión, le mostramos a todos.
    const isSuperAdmin = session.user.role === "superadmin";
    const showAll = searchParams.get("all") === "true";

    let where: any = {};
    
    if (showAll && isSuperAdmin) {
      // No role filter for Admin management view
      console.log(`[API/Traders] SuperAdmin loading all users for management`);
    } else {
      where = {
        OR: [
          { role: "trader" },
          { role: "superadmin" }
        ]
      };
    }

    // Si se requiere que tengan credenciales configuradas (para el directorio público)
    if (hasCredentials) {
      where = {
        ...where,
        credentialsApi: {
          isNot: null
        }
      };
    }

    const traders = await (prisma.user as any).findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        credentialsApi: { select: { id: true, updatedAt: true } },
      },
      orderBy: { name: 'asc' }
    });

    console.log(`[API/Traders] Found ${traders.length} traders`);

    return NextResponse.json({ traders });
  } catch (error) {
    console.error("[API/Traders] Critical Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
