"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ClientHeader } from "@/components/site-header-client";
import { getArticlesPaginated } from "@/lib/builder-client";

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

function normalizeTags(val: unknown): string[] {
  if (Array.isArray(val)) {
    const out: string[] = [];
    for (const t of val) {
      if (typeof t === 'string') out.push(t);
      else if (t && typeof t === 'object') {
        const r = t as Record<string, unknown>;
        if (typeof r.value === 'string') out.push(r.value as string);
        else if (typeof r.name === 'string') out.push(r.name as string);
        else if (typeof r.title === 'string') out.push(r.title as string);
      }
    }
    return Array.from(new Set(out.filter(Boolean))).slice(0, 30);
  }
  if (typeof val === 'string' && val.trim()) return [val.trim()];
  return [];
}

export default function ArticleList() {
  const [articles, setArticles] = useState<ArticleProps[]>([]);

  useEffect(() => {
    let mounted = true;
    getArticlesPaginated(ARTICLES_PER_PAGE, 0).then((res) => {
      if (mounted) setArticles(res as ArticleProps[]);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <ClientHeader />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((item) => {
            const tags = normalizeTags(item.data.tags);
            return (
              <li key={item.data.url}>
                <Link href={`/article${item.data.url}`}>
                  <div className="overflow-hidden border rounded-lg shadow-md hover:shadow-lg transition">
                    <div className="w-full h-48 bg-gray-100 overflow-hidden relative">
                      <Image
                        src={
                          typeof item.data.image === 'string'
                            ? item.data.image
                            : item.data.image?.src ?? ''
                        }
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
