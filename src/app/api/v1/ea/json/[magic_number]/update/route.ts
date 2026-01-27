import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ magic_number: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { magic_number } = await params;
    const body = await req.json();
    
    // PROXY JSON Update to External API
    const response = await fetch(`https://mt5.ittradew.com/api/v1/ea/json/${magic_number}/update`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify(body),
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
    console.error("Error updating EA JSON:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
