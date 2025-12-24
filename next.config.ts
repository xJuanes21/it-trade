import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Moved from experimental in Next.js 16
  serverExternalPackages: ["pg"],
  
  // Add turbopack config to silence error
  turbopack: {},
  
  webpack: (config) => {
    // Prevent Next from trying to resolve optional native bindings of 'pg'
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      "pg-native": false,
    };
    return config;
  },
};

export default nextConfig;
