"use client";
"use client";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { ClientHeader } from "@/components/site-header-client";
import { isBuilderReady } from "@/lib/builder-ready";
import { useClientReady } from "@/lib/use-client-ready";
import { useLocale } from "@/components/i18n-provider";

const BuilderOnly = dynamic(() => import("@/components/builder-client-only"), { ssr: false });

export default function Page() {
  const pathname = usePathname() || "/";
  const mounted = useClientReady();
  const { locale } = useLocale();
  return (
    <>
      <ClientHeader />
      <main>
        <div id="builder-page-slot">
          {mounted && isBuilderReady() ? (
            <BuilderOnly model="page" options={{ userAttributes: { urlPath: pathname }, locale }} />
          ) : null}
        </div>
      </main>
    </>
  );
}
