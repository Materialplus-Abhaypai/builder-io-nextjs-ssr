import { RenderBuilderContent } from "@/components/builder";
import { ServerHeader } from "@/components/site-header";
import { fetchPageByPath, fetchAllPagePaths } from "@/lib/builder-rest";

export const revalidate = 60;

type PageParams = { page: string[] };
interface PageProps { params: Promise<PageParams>; }

export default async function Page(props: PageProps) {
  const { page } = await props.params;
  const urlPath = "/" + (page?.join("/") || "");
  const model = "page";
  const content = await fetchPageByPath(urlPath);

  return (
    <>
      <ServerHeader />
      <RenderBuilderContent content={content} model={model} />
    </>
  );
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const pathSegments = await fetchAllPagePaths(100000, 1000);
  return pathSegments.map((segments) => ({ page: segments }));
}
