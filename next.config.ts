import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // This tells Turbopack to only look in your current project folder
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;