"use client";
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ClientHeader } from "@/components/site-header-client";
import { getArticlesPaginated } from "@/lib/builder-client";
import { getImageUrl, getTags } from "@/lib/content-utils";
import { useLocale } from "@/components/i18n-provider";

interface ArticleProps {
  id?: string;
  data: {
    title: string;
    image?: string | { src: string };
    date?: string;
    url?: string;
    tags?: unknown;
  };
}

const ARTICLES_PER_PAGE = 10;

export default function ArticleList() {
  const [articles, setArticles] = useState<ArticleProps[]>([]);
  const { locale } = useLocale();

  useEffect(() => {
    let mounted = true;
    getArticlesPaginated(ARTICLES_PER_PAGE, 0, locale).then((res) => {
      if (mounted) setArticles(res as ArticleProps[]);
    });
    return () => { mounted = false; };
  }, [locale]);

  return (
    <>
      <ClientHeader />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((item) => {
            const tags = getTags(item.data.tags);
            return (
              <li key={item.data.url}>
                <Link href={`/article${item.data.url}`}>
                  <div className="overflow-hidden border rounded-lg shadow-md hover:shadow-lg transition">
                    <div className="w-full h-48 bg-gray-100 overflow-hidden relative">
                      <Image
                        src={getImageUrl(item.data.image) || ""}
                        alt={item.data.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-semibold">{item.data.title}</h2>
                      {item.data.date && (
                        <p className="text-sm text-gray-500">{item.data.date}</p>
                      )}
                      {tags.length ? (
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <li key={tag} className="inline-block rounded-full bg-gray-100 text-gray-700 text-xs px-2.5 py-1">{tag}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
