"use client";
import { builder } from "@builder.io/sdk";

try {
  // Initialize SDK on client if not already
  if (!builder.apiKey) {
    builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);
  }
  if (typeof window !== "undefined") {
    (window as Window & { __BUILDER_INIT_DONE?: boolean }).__BUILDER_INIT_DONE = true;
  }
} catch {
  // ignore init errors in restricted environments
}

// If Builder is not configured with a public API key, noop network methods to prevent
// the SDK from attempting fetch calls that fail (helps dev when key is missing or blocked).
if (typeof window !== "undefined") {
  try {
    const b = builder as unknown as Record<string, unknown> & { apiKey?: string };
    if (!b.apiKey) {
      const bb = builder as unknown as Record<string, unknown> & { apiKey?: string };
      const noopGet = () => ({ toPromise: async () => null as null });
      const noopGetAll = async () => [] as unknown[];
      const noopSearch = async () => [] as unknown[];
      bb.get = noopGet as unknown;
      bb.getAll = noopGetAll as unknown;
      bb.search = noopSearch as unknown;
      console.warn("Builder SDK not initialized: network methods are noop. Set NEXT_PUBLIC_BUILDER_API_KEY to enable live fetching.");
    }
  } catch {
    // ignore
  }
}

export default function BuilderInit() {
  return null;
}
