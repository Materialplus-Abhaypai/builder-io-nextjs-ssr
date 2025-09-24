"use client";
import dynamic from "next/dynamic";
import BuilderInit from "@/components/builder-init";
import { ClientHeader } from "@/components/site-header-client";
import Link from "next/link";
import { isBuilderReady } from "@/lib/builder-ready";

const BuilderOnly = dynamic(() => import("@/components/builder-client-only"), { ssr: false });

export default function NotFound() {
  return (
    <>
      <ClientHeader />
      <BuilderInit />
      <main className="max-w-6xl mx-auto px-4 py-16">
        {isBuilderReady() ? (
          <>
            <BuilderOnly model="page" options={{ userAttributes: { urlPath: "/404" } }} />
            <BuilderOnly model="article" options={{ userAttributes: { urlPath: "/404" } }} />
          </>
        ) : (
          <div className="text-center text-gray-500 mb-6">Builder not configured (missing NEXT_PUBLIC_BUILDER_API_KEY)</div>
        )}
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
