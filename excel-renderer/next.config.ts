import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Enable compression for better performance on IIS
  compress: true,
  // Configure trailing slashes for IIS compatibility
  trailingSlash: false,
};

export default nextConfig;
