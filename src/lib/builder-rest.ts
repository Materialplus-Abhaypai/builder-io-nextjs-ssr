import { builder } from "@builder.io/sdk";
import { headers } from "next/headers";

// Initialize SDK once here
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

export const REVALIDATE_SECONDS = 60;

async function resolveLocale(): Promise<string> {
  const envLocale = process.env.NEXT_LOCALE;
  if (envLocale && typeof envLocale === "string") return envLocale;
  try {
    const h = await headers();
    const al = h.get("accept-language") || "";
    const first = al.split(",")[0]?.trim();
    if (!first) return "en";
    return /^[a-z]{2}(-[A-Z]{2})?$/.test(first) ? first : (first.split("-")[0] || "en");
  } catch {
    return "en";
  }
}

function normalizePath(input: string) {
  const s = (input || "").replace(/^\/+/i, "").replace(/\/$/, "");
  return { noLead: s, withLead: `/${s}` } as const;
}

export async function fetchPageByPath(urlPath: string) {
  const { withLead } = normalizePath(urlPath);
  const locale = await resolveLocale();
  return builder
    .get("page", {
      fetchOptions: { next: { revalidate: REVALIDATE_SECONDS } },
      options: { locale },
      userAttributes: { urlPath: withLead },
      prerender: false,
    })
    .toPromise();
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

export async function fetchNavigationLinks() {
  const locale = await resolveLocale();
  const all = await builder.getAll("navigation-links", {
    options: { includeRefs: true, noTargeting: true, locale },
    fields: "data",
    limit: 1,
  });

  const entry = (all?.[0] ?? null) as unknown;
  const entryData: Record<string, unknown> =
    isRecord(entry) && "data" in entry && isRecord((entry as { data?: unknown }).data)
      ? ((entry as { data?: unknown }).data as Record<string, unknown>)
      : {};

  let list: unknown[] = [];
  for (const key of Object.keys(entryData)) {
    const val = (entryData as Record<string, unknown>)[key];
    if (Array.isArray(val) && val.some((v) => isRecord(v))) {
      const hasUrlText = (val as unknown[]).some(
        (v) =>
          isRecord(v) &&
          (typeof (v as Record<string, unknown>).url === "string" ||
            typeof (v as Record<string, unknown>).link === "string") &&
          typeof (v as Record<string, unknown>).text === "string"
      );
      if (hasUrlText) {
        list = val as unknown[];
        break;
      }
    }
  }

  const items = (list.filter(isRecord) as Record<string, unknown>[]) // narrow to objects
    .map((r) => {
      const text = typeof r.text === "string" ? (r.text as string) : undefined;
      const link =
        typeof r.url === "string"
          ? (r.url as string)
          : typeof r.link === "string"
            ? (r.link as string)
            : undefined;
      return { text, link };
    })
    .filter((r): r is { text: string; link: string } => !!r.text && !!r.link);

  return items;
}

export async function fetchArticleByUrl(url: string) {
  const { withLead, noLead } = normalizePath(url);
  const candidates = [withLead, noLead, `/article/${noLead}`];
  const locale = await resolveLocale();
  for (const candidate of candidates) {
    const article = await builder
      .get("article", {
        fetchOptions: { next: { revalidate: REVALIDATE_SECONDS } },
        options: { includeRefs: true, noTargeting: true, locale },
        query: { "data.url": candidate },
      })
      .toPromise();
    if (article) return article;
  }
  return null;
}

export async function fetchArticleBySlug(slug: string) {
  const { noLead } = normalizePath(slug);
  const candidates = [noLead];
  const locale = await resolveLocale();
  for (const candidate of candidates) {
    const article = await builder
      .get("article", {
        fetchOptions: { next: { revalidate: REVALIDATE_SECONDS } },
        options: { includeRefs: true, noTargeting: true, locale },
        query: { "data.slug": candidate },
      })
      .toPromise();
    if (article) return article;
  }
  return null;
}

export async function fetchArticleByScan(url: string) {
  const { withLead, noLead } = normalizePath(url);
  const targets = [withLead, noLead, `/article/${noLead}`];
  const locale = await resolveLocale();
  for (const candidate of targets) {
    const arr = await builder.getAll("article", {
      options: { includeRefs: true, noTargeting: true, locale },
      fields: "data.title,data.url,data.blocks,data.image,data.date,data.tags,data.body",
      limit: 1,
      query: { "data.url": candidate },
    });
    if (arr?.length) return arr[0];
  }
  const all = await builder.getAll("article", {
    fetchOptions: { next: { revalidate: REVALIDATE_SECONDS } },
    options: { includeRefs: true, noTargeting: true, locale },
    fields: "data.title,data.url,data.blocks,data.image,data.date,data.tags,data.body",
    limit: 200,
  });

  const normalize = (v: unknown) => {
    const s = typeof v === "string" ? v : "";
    const trimmed = s.replace(/^\/+/i, "").replace(/\/$/, "");
    return `/${trimmed}`;
  };

  const getDataUrl = (item: unknown): unknown => {
    if (!isRecord(item)) return undefined;
    const data = (item as { data?: unknown }).data;
    if (!isRecord(data)) return undefined;
    return (data as Record<string, unknown>).url;
  };

  const target = normalize(noLead);
  return (all as unknown[]).find((item) => normalize(getDataUrl(item)) === target) || null;
}

export async function fetchArticlesPaginated(limit: number, offset: number) {
  const locale = await resolveLocale();
  return builder.getAll("article", {
    options: { includeRefs: true, noTargeting: true, locale },
    omit: "data.blocks",
    fields: "data.title,data.image,data.date,data.url,data.tags",
    limit,
    offset,
  });
}

export async function fetchAllPagePaths(max = 100000, limit = 1000) {
  const paths: string[][] = [];
  let offset = 0;
  const locale = await resolveLocale();
  while (offset < max) {
    const batch = await builder.getAll("page", {
      options: { includeRefs: true, noTargeting: true, locale },
      fields: "data.url",
      limit,
      offset,
    });
    if (!batch?.length) break;
    for (const item of batch as unknown[]) {
      let url: string | undefined;
      if (isRecord(item)) {
        const data = (item as { data?: unknown }).data;
        if (isRecord(data) && typeof (data as Record<string, unknown>).url === "string") {
          url = (data as Record<string, unknown>).url as string;
        }
      }
      if (typeof url === "string") {
        const norm = url.replace(/^\/+/i, "").replace(/\/$/, "");
        const segs = norm ? norm.split("/") : [];
        paths.push(segs);
      }
    }
    offset += batch.length;
    if (batch.length < limit) break;
  }
  return paths;
}

export async function fetchAllArticleSlugs(max = 100000, limit = 1000) {
  const slugs: string[] = [];
  let offset = 0;
  const locale = await resolveLocale();
  while (offset < max) {
    const batch = await builder.getAll("article", {
      options: { includeRefs: true, noTargeting: true, locale },
      fields: "data.url,data.slug",
      limit,
      offset,
    });
    if (!batch?.length) break;
    for (const item of batch as unknown[]) {
      let raw: string | undefined;
      if (isRecord(item)) {
        const data = (item as { data?: unknown }).data;
        if (isRecord(data)) {
          const d = data as Record<string, unknown>;
          raw = typeof d.url === "string" ? (d.url as string) : typeof d.slug === "string" ? (d.slug as string) : undefined;
        }
      }
      if (typeof raw === "string") {
        const norm = raw.replace(/^\/+/i, "").replace(/\/$/, "");
        slugs.push(norm);
      }
    }
    offset += batch.length;
    if (batch.length < limit) break;
  }
  return slugs;
}
