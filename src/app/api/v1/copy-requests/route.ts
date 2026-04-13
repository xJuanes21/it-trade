import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, id } = session.user;
    const p = prisma as any;

    let requests;
    const includeFollower = {
      follower: {
        select: {
          name: true,
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }
    };

    if (role === "trader") {
      requests = await p.copyRequest.findMany({
        where: { traderId: id },
        include: includeFollower,
        orderBy: { createdAt: "desc" }
      });
    } else if (role === "superadmin") {
      requests = await p.copyRequest.findMany({
        include: {
          ...includeFollower,
          trader: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
      });
    } else {
      requests = await p.copyRequest.findMany({
        where: { followerId: id },
        orderBy: { createdAt: "desc" }
      });
    }

    // --- ENRIQUECER CON INFO DE CUENTA SLAVE ---
    const slaveAccountIds = [...new Set(requests.map((r: any) => r.slaveAccountId))];
    const slaveAccounts = await p.tradeCopierAccount.findMany({
      where: {
        account_id: { in: slaveAccountIds }
      },
      select: {
        account_id: true,
        name: true,
        broker: true,
        login: true,
        server: true
      }
    });

    // Mapear los detalles a las solicitudes
    const enrichedRequests = requests.map((req: any) => ({
      ...req,
      slaveAccount: slaveAccounts.find((acc: any) => acc.account_id === req.slaveAccountId) || null
    }));

    return NextResponse.json({ status: "success", data: enrichedRequests });
  } catch (error) {
    console.error("GET Copy Requests Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const { slaveAccountId, masterAccountId, traderId } = payload;

    console.log("[POST /api/v1/copy-requests] Initiated", {
        followerId: session.user.id,
        traderId,
        slaveAccountId,
        masterAccountId
    });

    if (!slaveAccountId || !masterAccountId || !traderId) {
      return NextResponse.json({ 
        error: "Missing required fields", 
        details: { slaveAccountId, masterAccountId, traderId } 
      }, { status: 400 });
    }

    const p = prisma as any;

    // Check if a pending request already exists for this pair
    const existing = await p.copyRequest.findFirst({
      where: {
        followerId: session.user.id,
        slaveAccountId,
        masterAccountId,
        status: "PENDING"
      }
    });

    if (existing) {
      return NextResponse.json({ 
        status: "error", 
        message: "Ya tienes una solicitud pendiente para esta combinación de cuentas." 
      }, { status: 400 });
    }

    // Attempt to create the request
    const request = await p.copyRequest.create({
      data: {
        followerId: session.user.id,
        traderId,
        masterAccountId,
        slaveAccountId,
        status: "PENDING"
      }
    });

    console.log("[POST /api/v1/copy-requests] Success", { requestId: request.id });
    return NextResponse.json({ status: "success", data: request });
  } catch (error: any) {
    console.error("[POST /api/v1/copy-requests] Critical Error:", {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack
    });
    
    return NextResponse.json({ 
        error: "Internal Server Error", 
        message: "Ocurrió un error al procesar tu solicitud de copia en la base de datos.",
        details: error.message 
    }, { status: 500 });
  }
}
