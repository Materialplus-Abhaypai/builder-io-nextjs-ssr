import BuilderDevTools from "@builder.io/dev-tools/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = BuilderDevTools()({
  output: process.env.NEXT_OUTPUT_MODE === 'export' ? 'export' : undefined,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.builder.io', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
});

export default nextConfig;
