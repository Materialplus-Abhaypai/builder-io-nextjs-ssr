"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Image from "next/image";
import { BuilderComponent } from "@builder.io/react";
import { ClientHeader } from "@/components/site-header-client";
import { getArticleByUrlOrSlug } from "@/lib/builder-client";

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

function getData(obj: unknown): Record<string, unknown> | null {
  if (isRecord(obj) && "data" in obj) {
    const d = (obj as { data?: unknown }).data;
    if (isRecord(d)) return d as Record<string, unknown>;
  }
  return null;
}

function getImageUrl(val: unknown): string | undefined {
  if (typeof val === "string") return val;
  if (isRecord(val) && typeof val.src === "string") return val.src as string;
  return undefined;
}

function getTags(val: unknown): string[] {
  if (Array.isArray(val)) {
    const out: string[] = [];
    for (const t of val) {
      if (typeof t === "string") out.push(t);
      else if (isRecord(t)) {
        if (typeof (t as Record<string, unknown>).value === "string") out.push((t as Record<string, unknown>).value as string);
        else if (typeof (t as Record<string, unknown>).name === "string") out.push((t as Record<string, unknown>).name as string);
        else if (typeof (t as Record<string, unknown>).title === "string") out.push((t as Record<string, unknown>).title as string);
      }
    }
    return Array.from(new Set(out.filter(Boolean))).slice(0, 50);
  }
  if (typeof val === "string" && val.trim()) return [val.trim()];
  return [];
}

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const pathname = usePathname() || "/";
  const [article, setArticle] = useState<unknown | null>(null);

  const pathOrSlug = useMemo(() => params?.slug ?? pathname.replace(/^\//, ""), [params, pathname]);

  useEffect(() => {
    let mounted = true;
    getArticleByUrlOrSlug(pathOrSlug).then((res) => {
      if (mounted) setArticle(res);
    });
    return () => {
      mounted = false;
    };
  }, [pathOrSlug]);

  const data = getData(article);
  const imageUrl = getImageUrl(data?.["image"]);
  const title = typeof data?.["title"] === "string" ? (data?.["title"] as string) : "";
  const publishedDate = typeof data?.["date"] === "string" ? (data?.["date"] as string) : undefined;
  const tags = getTags(data?.["tag"]);
  const bodyHtml = typeof data?.["body"] === "string" ? (data?.["body"] as string) : "";

  // console.log("title", title);
  // console.log("bodyHtml", bodyHtml);
  // console.log("imageUrl", imageUrl);
  // console.log("tags", tags);

  return (
    <>
      <ClientHeader />
      <main className="max-w-3xl mx-auto px-4 py-10">
        {imageUrl ? (
          <div className="mb-6 overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt={title}
              width={1200}
              height={630}
              sizes="100vw"
              className="w-full h-auto object-cover"
            />
          </div>
        ) : null}
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        {publishedDate ? (
          <p className="text-sm text-gray-500 mb-4">{publishedDate}</p>
        ) : null}
        {tags.length ? (
          <ul className="mb-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag} className="inline-block rounded-full bg-gray-100 text-gray-700 text-xs px-3 py-1">{tag}</li>
            ))}
          </ul>
        ) : null}
        {bodyHtml ? <div className="mb-6" dangerouslySetInnerHTML={{ __html: bodyHtml }} /> : null}
        {/* Pass content so BuilderComponent doesn't refetch */}
        {article ? <BuilderComponent model="article" content={article as any} /> : <BuilderComponent model="article" options={{ userAttributes: { urlPath: pathname } }} />}
      </main>
    </>
  );
}
