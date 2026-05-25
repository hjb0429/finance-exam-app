import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Allow importing JSON from data directory
  experimental: {
    // static export with JSON works by default
  },
};

export default nextConfig;
