import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ["ts", "tsx"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
