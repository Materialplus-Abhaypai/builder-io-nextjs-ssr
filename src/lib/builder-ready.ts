"use client";
import { builder } from "@builder.io/sdk";

export function isBuilderReady(): boolean {
  try {
    if (typeof window === "undefined") return false;
    if (typeof (builder as { apiKey?: string }).apiKey === "string" && (builder as { apiKey?: string }).apiKey) return true;
    if (typeof window !== "undefined" && (window as Window & { __BUILDER_INIT_DONE?: boolean }).__BUILDER_INIT_DONE) return true;
    // NEXT_PUBLIC_* is inlined at build time; check it as fallback
    if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_BUILDER_API_KEY) return true;
    return false;
  } catch {
    return false;
  }
}
