import Image from "next/image";
import { ClientHeader } from "@/components/site-header-client";

interface ArticleMainProps {
  imageUrl?: string;
  title: string;
  publishedDate?: string;
  authors: string[];
  bodyHtml: string;
  children?: React.ReactNode;
}

export default function ArticleMain({ imageUrl, title, publishedDate, authors, bodyHtml, children }: ArticleMainProps) {
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
        {authors.length ? (
          <ul className="mb-6 flex flex-wrap gap-2">
            {authors.map((author) => (
              <li key={author} className="inline-block rounded-full bg-gray-100 text-gray-700 text-xs px-3 py-1">{author}</li>
            ))}
          </ul>
        ) : null}
        {bodyHtml ? <div className="mb-6 article-rich-text" dangerouslySetInnerHTML={{ __html: bodyHtml }} /> : null}
        {children}
      </main>
    </>
  );
}
