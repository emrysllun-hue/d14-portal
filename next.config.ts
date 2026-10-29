import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Removed cacheComponents and partialPrefetching to fix the map error
  turbopack: {
    root: path.join(__dirname),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;