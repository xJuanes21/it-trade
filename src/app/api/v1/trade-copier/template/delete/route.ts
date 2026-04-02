import { NextResponse } from "next/server";
import { auth } from "@/auth";

const EXTERNAL_BASE_URL = process.env.NEXT_PUBLIC_MT5_API_BASE_URL || "https://mt5.ittradew.com";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const externalResponse = await fetch(`${EXTERNAL_BASE_URL}/api/v1/trade-copier/template/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ payload: body }),
    });

    const result = await externalResponse.json();
    return NextResponse.json(result, { status: externalResponse.status });
  } catch (error) {
    console.error("Template Delete Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
