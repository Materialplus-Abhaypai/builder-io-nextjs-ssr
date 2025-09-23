import Link from "next/link";
import { RenderBuilderContent } from "@/components/builder";
import { ServerHeader } from "@/components/site-header";
import { fetchPageByPath, fetchArticleByUrl } from "@/lib/builder-rest";
import type { ComponentProps } from "react";
import { BuilderComponent } from "@builder.io/react";

export default async function NotFound() {
  type BuilderContent = ComponentProps<typeof BuilderComponent>["content"];
  const pageContent = await fetchPageByPath("/404");
  const articleContent = await fetchArticleByUrl("/404");

  const content = (pageContent ?? articleContent ?? undefined) as BuilderContent | undefined;
  const model = pageContent ? "page" : articleContent ? "article" : "page";

  return (
    <>
      <ServerHeader />
      <main className="max-w-6xl mx-auto px-4 py-16">
        <RenderBuilderContent model={model} content={content} />
        {!content && (
          <section className="text-center">
            <h1 className="text-3xl font-semibold">Page not found</h1>
            <p className="mt-2 text-neutral-600">The page you are looking for does not exist.</p>
            <div className="mt-6">
              <Link href="/" className="text-blue-600 hover:underline">Return to homepage</Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
