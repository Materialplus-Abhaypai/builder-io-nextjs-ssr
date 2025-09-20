import BuilderDevTools from "@builder.io/dev-tools/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = BuilderDevTools()({
  output: process.env.NEXT_OUTPUT_MODE === 'export' ? 'export' : undefined,
});

export default nextConfig;
