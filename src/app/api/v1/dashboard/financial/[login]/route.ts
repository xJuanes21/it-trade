import { auth } from "@/auth";
import { NextResponse } from "next/server";

const API_BASE_URL = "https://mt5.ittradew.com/api/v1/dashboard";

export async function GET(req: Request, { params }: { params: Promise<{ login: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { login } = await params;

    try {
      const externalResponse = await fetch(`${API_BASE_URL}/financial/${login}`, {
        headers: {
          'accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (!externalResponse.ok) {
        console.warn(`External dashboard financial fetch failed: ${externalResponse.status}`);
        return NextResponse.json({ message: "Upstream Error" }, { status: externalResponse.status });
      }

      const data = await externalResponse.json();
      return NextResponse.json(data);

    } catch (error) {
      console.error("Proxy error:", error);
      return NextResponse.json({ message: "Upstream Error" }, { status: 502 });
    }

  } catch (error) {
    console.error("Error fetching financial dashboard:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
