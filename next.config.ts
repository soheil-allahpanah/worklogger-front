import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // The dev indicator sits on the sidebar's user row.
  devIndicators: false,
};

export default nextConfig;
