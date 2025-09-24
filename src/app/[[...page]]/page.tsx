"use client";
import { usePathname } from "next/navigation";
import { BuilderComponent } from "@builder.io/react";
import { ClientHeader } from "@/components/site-header-client";

export default function Page() {
  const pathname = usePathname() || "/";
  return (
    <>
      <ClientHeader />
      <main>
        <BuilderComponent model="page" options={{ userAttributes: { urlPath: pathname } }} />
      </main>
    </>
  );
}
