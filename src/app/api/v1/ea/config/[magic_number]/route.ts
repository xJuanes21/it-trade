import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateConfigSchema = z.object({
  ea_name: z.string().optional(),
  symbol: z.string().optional(),
  timeframe: z.string().optional(),
  lot_size: z.coerce.number().positive().optional(),
  stop_loss: z.coerce.number().nonnegative().optional(),
  take_profit: z.coerce.number().nonnegative().optional(),
  max_trades: z.coerce.number().int().positive().optional(),
  trading_hours_start: z.coerce.number().int().min(0).max(23).optional(),
  trading_hours_end: z.coerce.number().int().min(0).max(23).optional(),
  risk_percent: z.coerce.number().min(0).max(100).optional(),
  enabled: z.boolean().optional(),
  custom_params: z.record(z.string(), z.any()).optional(),
});

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

    const response = {
       ea_name: config.eaName,
       magic_number: config.magicNumber,
       symbol: config.symbol,
       timeframe: config.timeframe,
       lot_size: config.lotSize,
       stop_loss: config.stopLoss,
       take_profit: config.takeProfit,
       max_trades: config.maxTrades,
       trading_hours_start: config.tradingHoursStart,
       trading_hours_end: config.tradingHoursEnd,
       risk_percent: config.riskPercent,
       enabled: config.enabled,
       custom_params: config.customParams,
       created_at: config.createdAt,
       updated_at: config.updatedAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error getting EA Config:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ magic_number: string }> }) {
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

      const body = await req.json();
      const result = updateConfigSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json({ detail: result.error.issues }, { status: 422 });
      }

      const existing = await prisma.eaConfig.findUnique({
        where: { magicNumber: magicNumber }
      });

      if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ message: "Not Found" }, { status: 404 });
      }

      const data = result.data;
      const updatedConfig = await prisma.eaConfig.update({
        where: { magicNumber: magicNumber },
        data: {
            eaName: data.ea_name,
            symbol: data.symbol,
            timeframe: data.timeframe,
            lotSize: data.lot_size,
            stopLoss: data.stop_loss,
            takeProfit: data.take_profit,
            maxTrades: data.max_trades,
            tradingHoursStart: data.trading_hours_start,
            tradingHoursEnd: data.trading_hours_end,
            riskPercent: data.risk_percent,
            enabled: data.enabled,
            customParams: data.custom_params ?? undefined, 
        }
      });

      const response = {
        ea_name: updatedConfig.eaName,
        magic_number: updatedConfig.magicNumber,
        symbol: updatedConfig.symbol,
        timeframe: updatedConfig.timeframe,
        lot_size: updatedConfig.lotSize,
        stop_loss: updatedConfig.stopLoss,
        take_profit: updatedConfig.takeProfit,
        max_trades: updatedConfig.maxTrades,
        trading_hours_start: updatedConfig.tradingHoursStart,
        trading_hours_end: updatedConfig.tradingHoursEnd,
        risk_percent: updatedConfig.riskPercent,
        enabled: updatedConfig.enabled,
        custom_params: updatedConfig.customParams,
        created_at: updatedConfig.createdAt,
        updated_at: updatedConfig.updatedAt,
     };
 
     return NextResponse.json(response);

    } catch (error) {
        console.error("Error updating EA Config:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ magic_number: string }> }) {
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

        await prisma.eaConfig.delete({
            where: { magicNumber: magicNumber }
        });

        return NextResponse.json({ message: "Config deleted" });
    } catch (error) {
        console.error("Error deleting EA Config:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
