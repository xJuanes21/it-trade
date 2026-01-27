import { auth } from "@/auth";
import { NextResponse } from "next/server";

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

    // PROXY to External API for Status
    try {
        const externalResponse = await fetch('https://mt5.ittradew.com/api/v1/ea/statuses', {
            headers: {
                'accept': 'application/json'
            },
            cache: 'no-store'
        });

        if (!externalResponse.ok) {
            // Fallback to offline mock if external fails?
             console.warn("External status fetch failed, using fallback mock");
             return NextResponse.json({
                ea_name: "Offline",
                magic_number: magicNumber,
                is_running: false,
                active_trades: 0,
                total_profit: 0,
                last_update: new Date().toISOString()
            });
        }

        const statuses = await externalResponse.json();
        // Find the specific bot status
        const botStatus = (statuses as { magic_number: number }[]).find((s) => s.magic_number === magicNumber);

        if (botStatus) {
            return NextResponse.json(botStatus);
        } else {
             // Bot found in config but not in status list (maybe stopped?)
            return NextResponse.json({
                ea_name: "Unknown",
                magic_number: magicNumber,
                is_running: false,
                active_trades: 0,
                total_profit: 0,
                last_update: new Date().toISOString()
            });
        }

    } catch (error) {
         console.error("Proxy error:", error);
         return NextResponse.json({ message: "Upstream Error" }, { status: 502 });
    }
  } catch (error) {
    console.error("Error getting EA Status:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
