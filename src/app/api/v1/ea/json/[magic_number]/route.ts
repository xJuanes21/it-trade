import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ magic_number: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { magic_number } = await params;
    
    // PROXY GET JSON Config from External API
    const response = await fetch(`https://mt5.ittradew.com/api/v1/ea/json/${magic_number}`, {
        headers: { 'accept': 'application/json' },
        cache: 'no-store'
    });

    if (!response.ok) {
        if (response.status === 404) {
            console.warn(`Upstream 404 for EA JSON config: ${magic_number}`);
            return NextResponse.json(null);
        }
        return NextResponse.json({ message: `Upstream Error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting EA JSON Config:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
