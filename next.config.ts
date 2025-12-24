import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Moved from experimental in Next.js 16
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  
  // Add turbopack config to silence error
  turbopack: {},
};

export default nextConfig;
