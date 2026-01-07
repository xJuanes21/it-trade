import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createConfigSchema = z.object({
  ea_name: z.string().min(1),
  magic_number: z.coerce.number().int(),
  symbol: z.string().min(1),
  timeframe: z.string().min(1),
  lot_size: z.coerce.number().positive(),
  stop_loss: z.coerce.number().nonnegative(),
  take_profit: z.coerce.number().nonnegative(),
  max_trades: z.coerce.number().int().positive(),
  trading_hours_start: z.coerce.number().int().min(0).max(23),
  trading_hours_end: z.coerce.number().int().min(0).max(23),
  risk_percent: z.coerce.number().min(0).max(100),
  enabled: z.boolean().optional().default(true),
  custom_params: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createConfigSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ detail: result.error.issues }, { status: 422 });
    }

    const data = result.data;

    const existing = await prisma.eaConfig.findUnique({
      where: { magicNumber: data.magic_number }
    });

    if (existing) {
       return NextResponse.json({ message: "Magic number already exists" }, { status: 409 });
    }

    const newConfig = await prisma.eaConfig.create({
      data: {
        userId: session.user.id,
        eaName: data.ea_name,
        magicNumber: data.magic_number,
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
        customParams: data.custom_params ?? {},
      },
    });

    const response = {
       ea_name: newConfig.eaName,
       magic_number: newConfig.magicNumber,
       symbol: newConfig.symbol,
       timeframe: newConfig.timeframe,
       lot_size: newConfig.lotSize,
       stop_loss: newConfig.stopLoss,
       take_profit: newConfig.takeProfit,
       max_trades: newConfig.maxTrades,
       trading_hours_start: newConfig.tradingHoursStart,
       trading_hours_end: newConfig.tradingHoursEnd,
       risk_percent: newConfig.riskPercent,
       enabled: newConfig.enabled,
       custom_params: newConfig.customParams,
       created_at: newConfig.createdAt,
       updated_at: newConfig.updatedAt,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error creating EA Config:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const configs = await prisma.eaConfig.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        const response = configs.map(c => ({
            ea_name: c.eaName,
            magic_number: c.magicNumber,
            symbol: c.symbol,
            timeframe: c.timeframe,
            lot_size: c.lotSize,
            stop_loss: c.stopLoss,
            take_profit: c.takeProfit,
            max_trades: c.maxTrades,
            trading_hours_start: c.tradingHoursStart,
            trading_hours_end: c.tradingHoursEnd,
            risk_percent: c.riskPercent,
            enabled: c.enabled,
            custom_params: c.customParams,
            created_at: c.createdAt,
            updated_at: c.updatedAt,
        }));

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching EA Configs:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
