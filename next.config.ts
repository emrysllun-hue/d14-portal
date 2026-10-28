import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: path.join(__dirname),
  },
  // ADD THIS BLOCK
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;