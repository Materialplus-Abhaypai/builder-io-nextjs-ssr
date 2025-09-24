"use client";
import { useEffect, useState } from "react";
import { SiteHeader, type NavLink } from "./site-header";
import { getNavigationLinks } from "@/lib/builder-client";

export function ClientHeader() {
  const [links, setLinks] = useState<NavLink[]>([]);
  useEffect(() => {
    let mounted = true;
    getNavigationLinks().then((l) => {
      if (mounted) setLinks(l ?? []);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return <SiteHeader links={links} />;
}
