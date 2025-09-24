"use client";
"use client";
import dynamic from "next/dynamic";
import { ClientHeader } from "@/components/site-header-client";
import Link from "next/link";
import { isBuilderReady } from "@/lib/builder-ready";
import { useClientReady } from "@/lib/use-client-ready";
import { useLocale } from "@/components/i18n-provider";

const BuilderOnly = dynamic(() => import("@/components/builder-client-only"), { ssr: false });

export default function NotFound() {
  const mounted = useClientReady();
  const { locale } = useLocale();
  return (
    <>
      <ClientHeader />
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div id="builder-404-slot">
          {mounted && isBuilderReady() ? (
            <>
              <BuilderOnly model="page" options={{ userAttributes: { urlPath: "/404" }, locale }} />
              <BuilderOnly model="article" options={{ userAttributes: { urlPath: "/404" }, locale }} />
            </>
          ) : null}
        </div>
        <section className="text-center">
          <h1 className="text-3xl font-semibold">Page not found</h1>
          <p className="mt-2 text-neutral-600">The page you are looking for does not exist.</p>
          <div className="mt-6">
            <Link href="/" className="text-blue-600 hover:underline">Return to homepage</Link>
          </div>
        </section>
      </main>
    </>
  );
}
