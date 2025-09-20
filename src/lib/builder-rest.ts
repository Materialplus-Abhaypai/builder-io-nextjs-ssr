import { builder } from "@builder.io/sdk";

// Initialize SDK once here
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

export const REVALIDATE_SECONDS = 60;

function normalizePath(input: string) {
  const s = (input || "").replace(/^\/+/, "").replace(/\/$/, "");
  return { noLead: s, withLead: `/${s}` } as const;
}

export async function fetchPageByPath(urlPath: string) {
  const { withLead } = normalizePath(urlPath);
  return builder
    .get("page", {
      fetchOptions: { next: { revalidate: REVALIDATE_SECONDS } },
      userAttributes: { urlPath: withLead },
      prerender: false,
    })
    .toPromise();
}

export async function fetchNavigationLinks() {
  const all = await builder.getAll("navigation-links", {
    options: { includeRefs: true, noTargeting: true },
    fields: "data",
    limit: 1,
  });
  const entry = all?.[0];
  const data = (entry?.data ?? {}) as Record<string, any>;
  let list: any[] = [];
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (Array.isArray(val) && val.some((v) => v && typeof v === "object")) {
      const hasUrlText = val.some((v) => ("url" in v || "link" in v) && ("text" in v));
      if (hasUrlText) {
        list = val;
        break;
      }
    }
  }
  return (list as any[])
    .map((r) => ({
      text: r?.text ?? r?.["text"],
      link: r?.url ?? r?.["url"] ?? r?.link ?? r?.["link"],
    }))
    .filter((r) => r && typeof r.text === "string" && typeof r.link === "string");
}

export async function fetchArticleByUrl(url: string) {
  const { withLead, noLead } = normalizePath(url);
  const candidates = [withLead, noLead, `/article/${noLead}`];
  for (const candidate of candidates) {
    const article = await builder
      .get("article", {
        fetchOptions: { next: { revalidate: REVALIDATE_SECONDS } },
        options: { includeRefs: true, noTargeting: true },
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
  for (const candidate of candidates) {
    const article = await builder
      .get("article", {
        fetchOptions: { next: { revalidate: REVALIDATE_SECONDS } },
        options: { includeRefs: true, noTargeting: true },
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
  for (const candidate of targets) {
    const arr = await builder.getAll("article", {
      options: { includeRefs: true, noTargeting: true },
      fields: "data.title,data.url,data.blocks,data.image,data.date",
      limit: 1,
      query: { "data.url": candidate },
    });
    if (arr?.length) return arr[0];
  }
  const all = await builder.getAll("article", {
    fetchOptions: { next: { revalidate: REVALIDATE_SECONDS } },
    options: { includeRefs: true, noTargeting: true },
    fields: "data.title,data.url,data.blocks,data.image,data.date",
    limit: 200,
  });
  const normalize = (v: any) => {
    const s = typeof v === "string" ? v : "";
    const trimmed = s.replace(/^\/+/, "").replace(/\/$/, "");
    return `/${trimmed}`;
  };
  const target = normalize(noLead);
  return all.find((item: any) => normalize(item?.data?.url) === target) || null;
}

export async function fetchArticlesPaginated(limit: number, offset: number) {
  return builder.getAll("article", {
    options: { includeRefs: true, noTargeting: true },
    omit: "data.blocks",
    fields: "data.title,data.image,data.date,data.url",
    limit,
    offset,
  });
}

export async function fetchAllPagePaths(max = 100000, limit = 1000) {
  const paths: string[][] = [];
  let offset = 0;
  while (offset < max) {
    const batch = await builder.getAll("page", {
      options: { includeRefs: true, noTargeting: true },
      fields: "data.url",
      limit,
      offset,
    });
    if (!batch?.length) break;
    for (const item of batch) {
      const url = (item as any)?.data?.url as string | undefined;
      if (typeof url === "string") {
        const norm = url.replace(/^\/+/, "").replace(/\/$/, "");
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
  while (offset < max) {
    const batch = await builder.getAll("article", {
      options: { includeRefs: true, noTargeting: true },
      fields: "data.url,data.slug",
      limit,
      offset,
    });
    if (!batch?.length) break;
    for (const item of batch) {
      const d = (item as any)?.data || {};
      const raw: string | undefined = d.url || d.slug;
      if (typeof raw === "string") {
        const norm = raw.replace(/^\/+/, "").replace(/\/$/, "");
        slugs.push(norm);
      }
    }
    offset += batch.length;
    if (batch.length < limit) break;
  }
  return slugs;
}
