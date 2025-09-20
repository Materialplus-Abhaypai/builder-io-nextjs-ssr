import Link from 'next/link';
import { ServerHeader } from '@/components/site-header';
import { fetchArticlesPaginated } from '@/lib/builder-rest';

export const revalidate = 60;

interface ArticleProps {
  id: string;
  data: {
    title: string;
    image?: string | { src: string };
    date?: string;
    url?: string;
  };
}

const ARTICLES_PER_PAGE = 10;

export default async function ArticleList() {
  const pageNumber = 1;

  const articles = await fetchArticlesPaginated(ARTICLES_PER_PAGE, (pageNumber - 1) * ARTICLES_PER_PAGE) as ArticleProps[];

  return (
    <>
      <ServerHeader />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((item) => (
            <li key={item.data.url}>
              <Link href={`/article${item.data.url}`}>
                <div className="overflow-hidden border rounded-lg shadow-md hover:shadow-lg transition">
                  <div className="w-full h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={
                        typeof item.data.image === 'string'
                          ? item.data.image
                          : (item.data.image as any)?.src
                      }
                      alt={item.data.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold">{item.data.title}</h2>
                    {item.data.date && (
                      <p className="text-sm text-gray-500">{item.data.date}</p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex justify-between max-w-md mx-auto text-blue-600 text-sm">
          {pageNumber > 1 && (
            <Link href={`/article/page/${pageNumber - 1}`}>&larr; Previous</Link>
          )}

          {articles.length === ARTICLES_PER_PAGE && (
            <Link href={`/article/page/${pageNumber + 1}`}>Next &rarr;</Link>
          )}
        </div>
      </div>
    </>
  );
}
