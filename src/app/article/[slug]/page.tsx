import { RenderBuilderContent } from '@/components/builder';
import { ServerHeader } from '@/components/site-header';
import { notFound } from 'next/navigation';
import { fetchArticleByUrl, fetchArticleBySlug, fetchArticleByScan, fetchAllArticleSlugs } from '@/lib/builder-rest';

export const revalidate = 60;

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

  let article: any = null;
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

  const imageUrl = typeof article?.data?.image === 'string'
    ? article.data.image
    : (article?.data?.image as any)?.src;
  const publishedDate = article?.data?.date as string | undefined;

  return (
    <>
      <ServerHeader />
      <main className="max-w-3xl mx-auto px-4 py-10">
        {imageUrl ? (
          <div className="mb-6 overflow-hidden rounded-lg">
            <img src={imageUrl} alt={article.data.title} className="w-full h-auto object-cover" />
          </div>
        ) : null}
        <h1 className="text-4xl font-bold mb-2">{article.data.title}</h1>
        {publishedDate ? (
          <p className="text-sm text-gray-500 mb-6">{publishedDate}</p>
        ) : null}
        <RenderBuilderContent content={article} model="article" />
      </main>
    </>
  );
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await fetchAllArticleSlugs(100000, 1000);
  return slugs.map((s) => ({ slug: s }));
}
