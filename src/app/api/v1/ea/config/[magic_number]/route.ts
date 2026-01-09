import { auth } from "@/auth";
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

// PROXY GET (Single)
export async function GET(req: Request, { params }: { params: Promise<{ magic_number: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { magic_number } = await params;
    
    const externalResponse = await fetch(`https://mt5.ittradew.com/api/v1/ea/config/${magic_number}`, {
        headers: { 'accept': 'application/json' },
        cache: 'no-store'
    });

    if (!externalResponse.ok) {
        if (externalResponse.status === 404) return NextResponse.json({ message: "Not Found" }, { status: 404 });
        return NextResponse.json({ message: `Upstream Error: ${externalResponse.status}` }, { status: externalResponse.status });
    }

    const data = await externalResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting EA Config:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// PROXY PUT
export async function PUT(req: Request, { params }: { params: Promise<{ magic_number: string }> }) {
    try {
      const session = await auth();
      if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
  
      const { magic_number } = await params;
      const body = await req.json();
      
      // Validate locally (optional but good practice)
      const result = updateConfigSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ detail: result.error.issues }, { status: 422 });
      }

      // PROXY to External API
      const externalResponse = await fetch(`https://mt5.ittradew.com/api/v1/ea/config/${magic_number}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify(body),
        cache: 'no-store'
      });

      if (!externalResponse.ok) {
        return NextResponse.json(
            { message: `Upstream Error: ${externalResponse.status} ${externalResponse.statusText}` }, 
            { status: externalResponse.status }
        );
      }

      const data = await externalResponse.json();
      return NextResponse.json(data);

    } catch (error) {
        console.error("Error updating EA Config:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// PROXY DELETE (Assuming explicit external delete support)
export async function DELETE(req: Request, { params }: { params: Promise<{ magic_number: string }> }) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
    
        const { magic_number } = await params;

        // PROXY to External API
        const externalResponse = await fetch(`https://mt5.ittradew.com/api/v1/ea/config/${magic_number}`, {
            method: 'DELETE',
            headers: { 'accept': 'application/json' },
            cache: 'no-store'
        });

        if (!externalResponse.ok) {
            return NextResponse.json(
                { message: `Upstream Error: ${externalResponse.status}` }, 
                { status: externalResponse.status }
            );
        }

        return NextResponse.json({ message: "Config deleted" });
    } catch (error) {
        console.error("Error deleting EA Config:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
