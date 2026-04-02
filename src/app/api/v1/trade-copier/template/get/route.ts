import { NextResponse } from "next/server";
import { auth } from "@/auth";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/template/get`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    const result = await externalResponse.json();
    return NextResponse.json(result, { status: externalResponse.status });
  } catch (error) {
    console.error("Template Get Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
