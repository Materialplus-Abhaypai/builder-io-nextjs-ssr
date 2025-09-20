import { RenderBuilderContent } from '@/components/builder';
import { ServerHeader } from '@/components/site-header';
import { notFound } from 'next/navigation';
import type { ComponentProps } from 'react';
import { BuilderComponent } from '@builder.io/react';
import Image from 'next/image';
import { fetchArticleByUrl, fetchArticleBySlug, fetchArticleByScan, fetchAllArticleSlugs } from '@/lib/builder-rest';

export const revalidate = 60;

type BuilderContentProp = ComponentProps<typeof BuilderComponent>['content'];

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

function getData(obj: unknown): Record<string, unknown> | null {
  if (isRecord(obj) && 'data' in obj) {
    const d = (obj as { data?: unknown }).data;
    if (isRecord(d)) return d as Record<string, unknown>;
  }
  return null;
}

function getImageUrl(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (isRecord(val) && typeof val.src === 'string') return val.src as string;
  return undefined;
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const raw = slug;
  const noLead = raw.replace(/^\/+/, '');
  const noTrail = noLead.replace(/\/$/, '');

  const urlCandidates = [
    `/${noTrail}`,
    noTrail,
    `/article/${noTrail}`,
  ];

  let article: unknown = null;
  for (const candidate of urlCandidates) {
    article = await fetchArticleByUrl(candidate);
    if (article) break;
  }

  if (!article) {
    const slugCandidates = [noTrail, noLead];
    for (const candidate of slugCandidates) {
      article = await fetchArticleBySlug(candidate);
      if (article) break;
    }
  }

  if (!article) {
    article = await fetchArticleByScan(noTrail);
  }

  if (!article) return notFound();

  const data = getData(article);
  const imageUrl = getImageUrl(data?.['image']);
  const title = typeof data?.['title'] === 'string' ? (data?.['title'] as string) : '';
  const publishedDate = typeof data?.['date'] === 'string' ? (data?.['date'] as string) : undefined;

  return (
    <>
      <ServerHeader />
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
          <p className="text-sm text-gray-500 mb-6">{publishedDate}</p>
        ) : null}
        <RenderBuilderContent content={article as BuilderContentProp} model="article" />
      </main>
    </>
  );
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await fetchAllArticleSlugs(100000, 1000);
  return slugs.map((s) => ({ slug: s }));
}
