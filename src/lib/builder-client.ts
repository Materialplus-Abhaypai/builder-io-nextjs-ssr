"use client";
import { builder } from "@builder.io/sdk";

if (!builder.apiKey) builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

export type NavLink = { text: string; link: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

export async function getNavigationLinks(): Promise<NavLink[]> {
  const all = await builder.getAll("navigation-links", {
    options: { includeRefs: true, noTargeting: true },
    fields: "data",
    limit: 1,
  });
  const entry = (all?.[0] ?? null) as unknown;
  const data = isRecord(entry) && "data" in entry && isRecord((entry as { data?: unknown }).data)
    ? ((entry as { data?: unknown }).data as Record<string, unknown>)
    : {};
  let list: unknown[] = [];
  for (const key of Object.keys(data)) {
    const val = (data as Record<string, unknown>)[key];
    if (Array.isArray(val) && val.some((v) => isRecord(v))) {
      const hasUrlText = (val as unknown[]).some(
        (v) => isRecord(v) && (typeof v.url === "string" || typeof v.link === "string") && typeof v.text === "string"
      );
      if (hasUrlText) {
        list = val as unknown[];
        break;
      }
    }
  }
  return (list.filter(isRecord) as Record<string, unknown>[])
    .map((r) => {
      const text = typeof r.text === "string" ? (r.text as string) : undefined;
      const link = typeof r.url === "string" ? (r.url as string) : typeof r.link === "string" ? (r.link as string) : undefined;
      return { text, link } as { text?: string; link?: string };
    })
    .filter((r): r is NavLink => !!r.text && !!r.link);
}

function normalizePath(input: string) {
  const s = (input || "").replace(/^\/+/, "").replace(/\/$/, "");
  return { noLead: s, withLead: `/${s}` } as const;
}

export async function getArticleByUrlOrSlug(pathOrSlug: string) {
  const { withLead, noLead } = normalizePath(pathOrSlug);
  const urlCandidates = [withLead, noLead, `/article/${noLead}`];

  // 1) Resolve by urlPath like BuilderComponent does (most reliable)
  for (const candidate of urlCandidates) {
    const byUrl = await builder
      .get("article", { userAttributes: { urlPath: candidate } })
      .toPromise();
    if (byUrl) return byUrl;
  }

  // 2) Fallback to querying data.url directly
  for (const candidate of urlCandidates) {
    const arr = await builder.getAll("article", {
      options: { includeRefs: true, noTargeting: true },
      fields: "data.title,data.url,data.blocks,data.image,data.date,data.tags,data.body",
      limit: 1,
      query: { "data.url": candidate },
    });
    if (arr?.[0]) return arr[0];
  }

  // 3) Fallback to slug
  const slugArr = await builder.getAll("article", {
    options: { includeRefs: true, noTargeting: true },
    fields: "data.title,data.url,data.blocks,data.image,data.date,data.tags,data.body,data.slug",
    limit: 1,
    query: { "data.slug": noLead },
  });
  if (slugArr?.[0]) return slugArr[0];

  // 4) Last resort: scan
  const all = await builder.getAll("article", {
    options: { includeRefs: true, noTargeting: true },
    fields: "data.title,data.url,data.blocks,data.image,data.date,data.tags,data.body",
    limit: 200,
  });
  const normalize = (v: unknown) => (typeof v === "string" ? v : "").replace(/^\/+/, "").replace(/\/$/, "");
  const target = normalize(noLead);
  return (all as unknown[]).find((it) => {
    if (!isRecord(it)) return false;
    const d = (it as { data?: unknown }).data;
    const url = isRecord(d) ? (d as Record<string, unknown>).url : undefined;
    return normalize(url) === target;
  }) || null;
}

export async function getArticlesPaginated(limit: number, offset: number) {
  return builder.getAll("article", {
    options: { includeRefs: true, noTargeting: true },
    omit: "data.blocks",
    fields: "data.title,data.image,data.date,data.url,data.tags",
    limit,
    offset,
  });
}
