"use client";
import { BuilderComponent } from "@builder.io/react";
import { ClientHeader } from "@/components/site-header-client";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <ClientHeader />
      <main className="max-w-6xl mx-auto px-4 py-16">
        <BuilderComponent model="page" options={{ userAttributes: { urlPath: "/404" } }} />
        <BuilderComponent model="article" options={{ userAttributes: { urlPath: "/404" } }} />
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
