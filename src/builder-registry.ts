"use client";
import { builder, Builder } from "@builder.io/react";
import { RenderBuilderContent } from "@/components/builder";
import { SiteHeader } from "@/components/site-header";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

Builder.registerComponent(RenderBuilderContent, {
  name: "RenderBuilderContent",
  inputs: [
    {
      name: "content",
      type: "string",
      meta: {
        ts: "any",
      },
      required: true,
    },
  ],
});

Builder.registerComponent(SiteHeader, {
  name: "SiteHeader",
  inputs: [
    {
      name: "links",
      type: "list",
      subFields: [
        { name: "text", type: "string", required: true },
        { name: "link", type: "url", required: true },
      ],
      helperText: "Optional: override links from the Section model",
    },
  ],
});

Builder.registerComponent(Builder, {
  name: "Builder",
});
