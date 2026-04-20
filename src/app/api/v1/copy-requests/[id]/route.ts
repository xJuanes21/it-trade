import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTradeCopierHeaders } from "@/lib/trade-copier-headers";
import { decrypt } from "@/lib/encryption";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, message } = body;

    if (!["APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Usar (prisma as any) para evitar errores si las tablas son nuevas
    const request = await (prisma as any).copyRequest.findUnique({
      where: { id },
    });

    if (!request) {
      console.error(`[PATCH /api/v1/copy-requests/${id}] Solicitud no encontrada en DB.`);
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Seguridades
    if (status === "CANCELLED" && request.followerId !== session.user.id) {
      console.warn(`[PATCH /api/v1/copy-requests/${id}] Usuario ${session.user.id} no autorizado para cancelar solicitud de ${request.followerId}`);
      return NextResponse.json({ error: "No eres el autor de esta solicitud." }, { status: 403 });
    }
    
    if (["APPROVED", "REJECTED"].includes(status) && request.traderId !== session.user.id && session.user.role !== "superadmin") {
      console.warn(`[PATCH /api/v1/copy-requests/${id}] Usuario ${session.user.id} no autorizado para gestionar solicitud de Trader ${request.traderId}`);
      return NextResponse.json({ error: "Acceso denegado. No eres el trader dueño de esta estrategia." }, { status: 403 });
    }

    // 2. Ejecutar Acción según el estado solicitado
    const normalizedStatus = status?.toUpperCase().trim();
    let externalApiResult = null;

    // --- CASO APROBACIÓN: Generar cuenta Slave en MT5 (START) o Eliminar (STOP) ---
    if (normalizedStatus === "APPROVED") {
      const p = prisma as any;
      const externalHeaders = await getTradeCopierHeaders(request.traderId);

      if (request.type === "STOP_COPYING") {
        // --- CASO STOP: Eliminar de MT5 Server y Limpiar DB Local ---
        const response = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/account/delete`, {
          method: "POST",
          headers: externalHeaders,
          body: JSON.stringify({ payload: { account_id: request.slaveAccountId } })
        });
        
        externalApiResult = await response.json();

        if (!response.ok || externalApiResult.status !== "success") {
           // Si falla el borrado externo, igual informamos, pero permitimos continuar si es error de "no existe"
           console.warn(`[PATCH /api/v1/copy-requests/${id}] Fallo eliminación externa en STOP:`, externalApiResult);
        }

        // 1. Eliminar SyncConfig
        await p.syncConfig.deleteMany({
          where: {
            masterAccountId: request.masterAccountId,
            slaveAccountId: request.slaveAccountId
          }
        });

        // 2. Eliminar TradeCopierAccount
        await p.tradeCopierAccount.delete({
          where: { account_id: request.slaveAccountId }
        });

      } else {
        // --- CASO START: Crear en MT5 Server (Lógica original) ---
        const slaveAccount = await p.tradeCopierAccount.findUnique({
          where: { account_id: request.slaveAccountId }
        });

        if (!slaveAccount) {
          console.error(`[PATCH /api/v1/copy-requests/${id}] -> ERR: Slave log ${request.slaveAccountId} no existe.`);
          return NextResponse.json({ error: "Cuenta de seguidor no localizada." }, { status: 404 });
        }

        let decryptedPassword = "";
        try {
          if (slaveAccount.password) decryptedPassword = decrypt(slaveAccount.password);
        } catch (e) {
          console.warn(`[PATCH /api/v1/copy-requests/${id}] -> No se pudo decifrar password.`);
        }

        const payload = {
          name: slaveAccount.name || `Slave_${slaveAccount.login}`,
          type: 1, // 1 = SLAVE
          broker: slaveAccount.broker,
          login: slaveAccount.login,
          password: decryptedPassword,
          server: slaveAccount.server,
          group: request.masterAccountId, // ID del Master (Group)
          status: 1 // 1 = ACTIVE
        };

        const response = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/account/add`, {
          method: "POST",
          headers: externalHeaders,
          body: JSON.stringify({ payload })
        });

        externalApiResult = await response.json();

        if (!response.ok || externalApiResult.status !== "success") {
          return NextResponse.json({ 
            error: "Error en Servidor Externo", 
            message: externalApiResult.message || "La API de MT5 rechazó la creación de la cuenta.",
            details: externalApiResult
          }, { status: 502 });
        }

        // --- Validaciones de límites etc ... ---
        if (externalApiResult.data?.error || externalApiResult.data?.code) {
          return NextResponse.json({ 
            error: "Límite de Suscripción", 
            message: externalApiResult.data.error || "No tienes permisos suficientes en IT TRADE para agregar más cuentas.",
            code: externalApiResult.data.code
          }, { status: 403 });
        }

        // Sincronizar ID si cambió
        const realId = externalApiResult?.data?.account?.account_id || externalApiResult?.data?.account_id || externalApiResult?.account_id;
        if (realId && String(realId) !== String(request.slaveAccountId)) {
          await p.tradeCopierAccount.update({
            where: { account_id: request.slaveAccountId },
            data: { account_id: String(realId) }
          });
          request.slaveAccountId = String(realId);
        }
      }
    }

    // --- CASO RECHAZO/CANCELACIÓN: Limpiar si era APPROVED y tipo START ---
    if (["REJECTED", "CANCELLED"].includes(normalizedStatus) && 
        request.status === "APPROVED" && 
        request.type === "START_COPYING") {
      const externalHeaders = await getTradeCopierHeaders(request.traderId);
      const response = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/account/delete`, {
        method: "POST",
        headers: externalHeaders,
        body: JSON.stringify({ payload: { account_id: request.slaveAccountId } })
      });
      externalApiResult = await response.json();
    }

    // 3. Persistir cambio final en DB
    const updatedRequest = await (prisma as any).copyRequest.update({
      where: { id },
      data: { 
        status: normalizedStatus as any, 
        slaveAccountId: request.slaveAccountId,
        message: message || (
          normalizedStatus === "APPROVED" 
            ? (request.type === "STOP_COPYING" ? "Relación finalizada con éxito" : "Aprobado")
            : "Gestionado por el trader"
        )
      }
    });

    return NextResponse.json({ 
      status: "success", 
      data: updatedRequest,
      externalApiResult // Pasamos esto para verificar en el frontend qué dijo el servidor MT5
    });
  } catch (error: any) {
    console.error(`[PATCH /api/v1/copy-requests/${id}] CRITICAL ERROR:`, error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message || "Ocurrió un error inesperado al procesar la solicitud." 
    }, { status: 500 });
  }
}
