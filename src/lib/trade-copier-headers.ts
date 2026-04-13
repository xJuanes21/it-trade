import { prisma } from "@/lib/prisma";

/**
 * Recovers the encrypted API credentials for the given user 
 * and returns the appropriate headers for external Trade Copier requests.
 */
export async function getTradeCopierHeaders(userId: string): Promise<HeadersInit> {
  const credentials = await prisma.credentialsApi.findUnique({
    where: { userId }
  });

  if (!credentials || !credentials.data) {
    throw new Error("CredentialsApiConfigurationMissing");
  }

  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "CP-Data-Type": credentials.data
  };

  return baseHeaders;
}
