import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // PROXY GET all JSON Configs from External API
    const response = await fetch(`https://mt5.ittradew.com/api/v1/ea/json/list/all`, {
        headers: { 
          'accept': 'application/json' 
        },
        cache: 'no-store'
    });

    if (!response.ok) {
        console.error(`Upstream error in JSON list: ${response.status}`);
        return NextResponse.json({ 
          success: false, 
          message: `Upstream Error: ${response.status}` 
        }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error listing all EA JSON Configs:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal Server Error" 
    }, { status: 500 });
  }
}
