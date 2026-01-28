import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ magic_number: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { magic_number } = await params;
    const { searchParams } = new URL(req.url);
    const lotaje = searchParams.get('lotaje');

    if (!lotaje) {
        return NextResponse.json({ message: "Lotaje is required" }, { status: 400 });
    }
    
    // PROXY Lotaje to External API
    const response = await fetch(`https://mt5.ittradew.com/api/v1/ea/${magic_number}/lotaje?lotaje=${lotaje}`, {
        method: 'PATCH',
        headers: {
            'accept': 'application/json'
        },
        cache: 'no-store'
    });

    if (!response.ok) {
        return NextResponse.json(
            { message: `Upstream Error: ${response.status} ${response.statusText}` }, 
            { status: response.status }
        );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating lotaje:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
