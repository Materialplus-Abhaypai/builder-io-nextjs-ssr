"use client";
"use client";

import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { ClientHeader } from "@/components/site-header-client";
import { getArticleByUrlOrSlug, getDataDb } from "@/lib/builder-client";
import { isBuilderReady } from "@/lib/builder-ready";
import { useClientReady } from "@/lib/use-client-ready";
import { useLocale } from "@/components/i18n-provider";
import ArticleMain from "@/components/article-main";

const BuilderOnly = dynamic(() => import("@/components/builder-client-only"), { ssr: false });

type BuilderContent = ComponentProps<typeof BuilderOnly>["content"];

interface PageProps {
  params: {
    page: string[];
  };
}

export default function Page(props: PageProps) {
  const pathname = usePathname() || "/";
  const mounted = useClientReady();
  const { locale } = useLocale();
  const [article, setArticle] = useState<unknown | null>(null);
  const [authors, setAuthors] = useState<string[]>([]);
  // Try to fetch article for current path
  useEffect(() => {
    let active = true;
    getArticleByUrlOrSlug(pathname, locale).then((res) => {
      if (active) {
        setArticle(res);
        getDataDb(res?.data?.authors).then((authors) => {
          setAuthors(authors);
        });
      }
    });
    return () => { active = false; };
  }, [pathname, locale]);

  if (mounted && isBuilderReady() && article) {
    // Extract article data using getData and helpers
    const { getData, getImageUrl } = require("@/lib/content-utils");
    const data = getData(article);
    const imageUrl = getImageUrl(data?.["heroImage"]);
    const title = typeof data?.["title"] === "string" ? (data?.["title"] as string) : "Untitled";
    const publishedDate = typeof data?.["displayDate"] === "string" ? (data?.["displayDate"] as string) : "";
    
    const bodyHtml = typeof data?.["body"] === "string" ? (data?.["body"] as string) : "";
    return (
      <ArticleMain
        imageUrl={imageUrl}
        title={title}
        publishedDate={publishedDate}
        authors={authors}
        bodyHtml={bodyHtml}
      >
        <BuilderOnly model="article" content={article as BuilderContent}  />
      </ArticleMain>
    );
  }
  return (
    <>
      <ClientHeader />
      <main>
        <div id="builder-page-slot">
          {mounted && isBuilderReady() ? (
            <BuilderOnly model="page" options={{ userAttributes: { urlPath: pathname }, locale }} />
          ) : null}
        </div>
      </main>
    </>
  );
}
