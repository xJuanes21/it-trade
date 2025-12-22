import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Ensure 'pg' isn't bundled into client/RSC; keep it server-side only
    serverComponentsExternalPackages: ["pg"],
  },
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
