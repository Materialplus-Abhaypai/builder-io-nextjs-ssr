"use client";
import { builder } from "@builder.io/sdk";

try {
  // Initialize SDK on client if not already
  if (!builder.apiKey) {
    builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);
  }
} catch {
  // ignore init errors in restricted environments
  // console.warn("Builder init failed");
}

export default function BuilderInit() {
  return null;
}
