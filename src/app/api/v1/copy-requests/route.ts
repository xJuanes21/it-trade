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
    let { slaveAccountId, masterAccountId, traderId, type = "START_COPYING" } = payload;

    if (!slaveAccountId) {
      return NextResponse.json({ error: "Missing slaveAccountId" }, { status: 400 });
    }

    const p = prisma as any;

    // Smart resolution for STOP_COPYING
    if (type === "STOP_COPYING" && (!masterAccountId || !traderId)) {
        // 1. Resolve the "True" account_id if it's a local proxy
        let targetSlaveId = slaveAccountId;
        const currentAccount = await p.tradeCopierAccount.findUnique({
            where: { account_id: slaveAccountId }
        });

        if (currentAccount && slaveAccountId.startsWith("local_")) {
            // Find if there's a linked version of this account (same login/broker, not local)
            const linkedAccount = await p.tradeCopierAccount.findFirst({
                where: {
                    userId: currentAccount.userId,
                    login: currentAccount.login,
                    broker: currentAccount.broker,
                    NOT: { account_id: { startsWith: "local_" } }
                }
            });
            if (linkedAccount) {
                targetSlaveId = linkedAccount.account_id;
            }
        }

        const syncConfig = await p.syncConfig.findFirst({
            where: { slaveAccountId: targetSlaveId }
        });
        
        if (!syncConfig) {
            return NextResponse.json({ 
                status: "error", 
                message: "No se encontró una configuración de copia activa para esta cuenta." 
            }, { status: 404 });
        }

        masterAccountId = syncConfig.masterAccountId;

        // Find the Trader who owns the Master account
        const masterAccount = await p.tradeCopierAccount.findUnique({
            where: { account_id: masterAccountId },
            select: { userId: true }
        });

        if (!masterAccount) {
            return NextResponse.json({ status: "error", message: "No se pudo identificar al trader maestro." }, { status: 404 });
        }
        traderId = masterAccount.userId;
        
        // Update variables for the rest of the flow
        slaveAccountId = targetSlaveId;
    }

    if (!masterAccountId || !traderId) {
      return NextResponse.json({ 
        error: "Missing required fields: masterAccountId or traderId", 
        details: { slaveAccountId, masterAccountId, traderId } 
      }, { status: 400 });
    }

    // Check if a pending request already exists for this pair and type
    const existing = await p.copyRequest.findFirst({
      where: {
        followerId: session.user.id,
        slaveAccountId,
        masterAccountId,
        type,
        status: "PENDING"
      }
    });

    if (existing) {
      return NextResponse.json({ 
        status: "error", 
        message: `Ya tienes una solicitud de ${type === "START_COPYING" ? "copiado" : "finalización"} pendiente para esta cuenta.` 
      }, { status: 400 });
    }

    // Attempt to create the request
    const request = await p.copyRequest.create({
      data: {
        followerId: session.user.id,
        traderId,
        masterAccountId,
        slaveAccountId,
        type,
        status: "PENDING"
      }
    });

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
