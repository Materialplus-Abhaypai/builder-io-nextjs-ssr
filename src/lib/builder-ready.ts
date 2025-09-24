"use client";
import { builder } from "@builder.io/sdk";

export function isBuilderReady(): boolean {
  try {
    if (typeof window === "undefined") return false;
    if (typeof builder.apiKey === "string" && builder.apiKey) return true;
    // NEXT_PUBLIC_* is inlined at build time; check it as fallback
        if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_BUILDER_API_KEY) return true;
    return false;
  } catch {
    return false;
  }
}
