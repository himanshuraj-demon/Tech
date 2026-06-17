import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export",
  images: {
    unoptimized: true, // Disable image optimization for static export
  },
  // Ensure static files are properly handled
  trailingSlash: false,
};

export default nextConfig;
