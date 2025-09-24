"use client";
"use client";
import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { useParams, usePathname } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ClientHeader } from "@/components/site-header-client";
import { getArticleByUrlOrSlug } from "@/lib/builder-client";
import { useIsPreviewing } from "@builder.io/react";
import { builder } from "@builder.io/sdk";
import { getData, getImageUrl, getTags } from "@/lib/content-utils";
import { isBuilderReady } from "@/lib/builder-ready";
import { useClientReady } from "@/lib/use-client-ready";
import { useLocale } from "@/components/i18n-provider";

const BuilderOnly = dynamic(() => import("@/components/builder-client-only"), { ssr: false });

type BuilderContent = ComponentProps<typeof BuilderOnly>["content"];

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const pathname = usePathname() || "/";
  const mounted = useClientReady();
  const { locale } = useLocale();
  const [article, setArticle] = useState<unknown | null>(null);
  const [previewBody, setPreviewBody] = useState<string>("");
  const isPreviewing = useIsPreviewing();

  const pathOrSlug = useMemo(() => params?.slug ?? pathname.replace(/^\//, ""), [params, pathname]);

  useEffect(() => {
    let mounted = true;
    getArticleByUrlOrSlug(pathOrSlug, locale).then((res) => {
      if (mounted) setArticle(res);
    });
    return () => {
      mounted = false;
    };
  }, [pathOrSlug, locale]);

  useEffect(() => {
    if (!isPreviewing) return;
    let mounted = true;
    const fetchPreview = async () => {
      const candidates = [pathOrSlug, `/article/${pathOrSlug}`];
      for (const u of candidates) {
        const res = await builder
          .get("article", {
            url: u,
            cachebust: true,
            options: { noTargeting: true, includeRefs: true, locale },
          })
          .toPromise();
        if (res) {
          if (!mounted) return;
          setArticle(res as unknown);
          const d = getData(res);
          const html = typeof d?.["body"] === "string" ? (d?.["body"] as string) : "";
          setPreviewBody(html);
          break;
        }
      }
    };
    fetchPreview().catch(() => {});
    return () => { mounted = false; };
  }, [isPreviewing, pathOrSlug, locale]);

  const data = getData(article);
  const imageUrl = getImageUrl(data?.["image"]);
  const title = typeof data?.["title"] === "string" ? (data?.["title"] as string) : "";
  const publishedDate = typeof data?.["date"] === "string" ? (data?.["date"] as string) : undefined;
  const tags = getTags(data?.["tags"]);
  const bodyHtml = previewBody || (typeof data?.["body"] === "string" ? (data?.["body"] as string) : "");

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
        {bodyHtml ? <div className="mb-6 article-rich-text" dangerouslySetInnerHTML={{ __html: bodyHtml }} /> : null}
        {/* Pass content so BuilderComponent doesn't refetch */}
        {mounted && isBuilderReady() ? (
          article ? <BuilderOnly model="article" content={article as BuilderContent} /> : <BuilderOnly model="article" options={{ userAttributes: { urlPath: pathname }, locale }} />
        ) : null}
      </main>
    </>
  );
}
