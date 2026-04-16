import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

const API_BASE_URL = "https://mt5.ittradew.com/api/v1/dashboard";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }


    // 1. Get Local Accounts (Ownership Source of Truth)
    const localAccounts = await prisma.mt5Account.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        login: true
      }
    });

    const localLogins = new Set(localAccounts.map(a => a.login));

    try {
      // 2. Get External Data (Data Source)
      const externalResponse = await fetch(`${API_BASE_URL}/accounts`, {
        headers: {
          'accept': 'application/json',
          'x-user-id': session.user.id,
          'x-user-email': session.user.email || ""
        },
        cache: 'no-store'
      });

      if (!externalResponse.ok) {
        console.warn(`External dashboard accounts fetch failed: ${externalResponse.status}`);
        
        if (externalResponse.status === 404) {
             return NextResponse.json([]);
        }
        return NextResponse.json({ message: "Failed to fetch accounts from proxy" }, { status: externalResponse.status });
      }

      const externalData = await externalResponse.json();

      // 3. Filter: Only return accounts that the user OWNS locally
      if (Array.isArray(externalData)) {
          const filteredData = externalData.filter((account: any) => {
              // Convert both to string or number to be safe
              return localLogins.has(String(account.login));
          });
          
          return NextResponse.json(filteredData);
      }
      
      // If not array, return as is (but likely empty or error structure)
      return NextResponse.json(externalData);

    } catch (error) {
      console.error("Proxy error fetching accounts:", error);
      return NextResponse.json({ message: "Error connecting to MT5 Proxy" }, { status: 502 });
    }

  } catch (error) {
    console.error("Error fetching dashboard accounts:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
