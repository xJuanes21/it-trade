import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTradeCopierHeaders } from "@/lib/trade-copier-headers";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();

    if (!id) return NextResponse.json({ error: "ID requerido." }, { status: 400 });

    // Get Security Headers
    let externalHeaders;
    try {
      externalHeaders = await getTradeCopierHeaders(session.user.id);
    } catch (err: any) {
      if (err.message === "CredentialsApiConfigurationMissing") {
        return NextResponse.json({ 
          error: "Configuración Faltante", 
          message: "Debes configurar tus credenciales de API en el módulo de Configuraciones primero." 
        }, { status: 400 });
      }
      throw err;
    }

    // 1. Fetch the actual model from DB
    const modelIcon: any = await prisma.tradingModel.findUnique({
      where: { id },
    });

    if (!modelIcon || (modelIcon.userId !== session.user.id && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "No encontrado o sin permisos." }, { status: 404 });
    }

    // 2. Ownership Logic: Delete from External API ONLY if it's the owner's original model
    const isOwner = !modelIcon.isClone || modelIcon.userId === modelIcon.ownerId || !modelIcon.ownerId;

    if (isOwner && modelIcon.group_id) {
       try {
         const extRes = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/template/delete`, {
           method: "POST",
           headers: { 
             ...externalHeaders,
             "Content-Type": "application/json" 
           },
           body: JSON.stringify({ payload: { group_id: modelIcon.group_id } }),
         });
         
         if (!extRes.ok) {
            const errorText = await extRes.text();
            console.error(`External Delete Failed (${extRes.status}):`, errorText);
            
            // If the server tells us it doesn't exist (404/400 with specific msg), 
            // we should allow local deletion to clean up.
            // But if it's a 502/Timeout, we block local deletion to avoid orphan groups.
            if (extRes.status !== 404 && extRes.status !== 400) {
              return NextResponse.json({ 
                error: "External API Error", 
                message: `El Servidor de IT TRADE no permitió eliminar el modelo (${extRes.status}). Inténtalo más tarde.` 
              }, { status: extRes.status });
            }
         }
         
         const extData = await extRes.json();
         if (extData.status !== "success" && !extData.message?.includes("not found")) {
            return NextResponse.json({ 
              error: "Sync Error", 
              message: extData.message || "Error al eliminar en el Servidor de IT TRADE." 
            }, { status: 502 });
         }
       } catch (err) {
         console.error("External delete error:", err);
         return NextResponse.json({ 
           error: "Connection Error", 
           message: "No se pudo conectar con el Servidor de IT TRADE para eliminar el modelo." 
         }, { status: 502 });
       }
    }

    // 3. Delete Local Prisma Entry (Only if external sync succeeded or was not needed)
    await prisma.tradingModel.delete({ where: { id } });

    return NextResponse.json({ 
      success: true, 
      message: "Template eliminado correctamente." + (isOwner ? " Sincronizado con el Servidor de IT TRADE." : " (Copia local eliminada)") 
    });
  } catch (error) {
    console.error("Delete Model Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
