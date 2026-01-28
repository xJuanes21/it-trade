import { auth } from "@/auth";
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
  custom_params: z.record(z.string(), z.unknown()).optional(),
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

    // PROXY to External API
    const externalResponse = await fetch('https://mt5.ittradew.com/api/v1/ea/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    });

    if (!externalResponse.ok) {
        const errorData = await externalResponse.json().catch(() => ({}));
        return NextResponse.json(
            { message: errorData.message || `Upstream Error: ${externalResponse.status}` }, 
            { status: externalResponse.status }
        );
    }

    const responseData = await externalResponse.json();
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error creating EA Config:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(_req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // PROXY to External API
        const externalResponse = await fetch('https://mt5.ittradew.com/api/v1/ea/configs', {
            headers: {
                'accept': 'application/json'
            },
            cache: 'no-store'
        });

        if (!externalResponse.ok) {
            throw new Error(`External API Error: ${externalResponse.statusText}`);
        }

        const data = await externalResponse.json();
        
        // Return data directly as it matches our interface (snake_case)
        // User requested: "solo sea accequilbe ese bot" (Filtered if needed, but endpoint returns list)
        return NextResponse.json(data);

    } catch (error) {
        console.error("Error fetching EA Configs from External:", error);
        return NextResponse.json({ message: "External Service Unavailable" }, { status: 502 });
    }
}
