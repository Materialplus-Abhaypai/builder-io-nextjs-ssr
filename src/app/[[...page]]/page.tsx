"use client";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import BuilderInit from "@/components/builder-init";
import { ClientHeader } from "@/components/site-header-client";
import { isBuilderReady } from "@/lib/builder-ready";

const BuilderOnly = dynamic(() => import("@/components/builder-client-only"), { ssr: false });

export default function Page() {
  const pathname = usePathname() || "/";
  return (
    <>
      <ClientHeader />
      <BuilderInit />
      <main>
        {isBuilderReady() ? (
          <BuilderOnly model="page" options={{ userAttributes: { urlPath: pathname } }} />
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">Builder not configured (missing NEXT_PUBLIC_BUILDER_API_KEY)</div>
        )}
      </main>
    </>
  );
}
