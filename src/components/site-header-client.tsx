"use client";
import { useEffect, useState } from "react";
import { SiteHeader, type NavLink } from "./site-header";
import { getNavigationLinks } from "@/lib/builder-client";
import { useLocale } from "@/components/i18n-provider";

export function ClientHeader() {
  const [links, setLinks] = useState<NavLink[]>([]);
  const { locale } = useLocale();
  useEffect(() => {
    let mounted = true;
    getNavigationLinks(locale).then((l) => {
      if (mounted) setLinks(l ?? []);
    });
    return () => {
      mounted = false;
    };
  }, [locale]);
  return <SiteHeader links={links} />;
}
