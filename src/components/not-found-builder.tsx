"use client";
import { Builder, BuilderComponent } from "@builder.io/react";

export function NotFoundBuilderUi({ model = "page" }: { model?: "page" | "article" }) {
  if (typeof Builder !== "undefined" && (Builder.isPreviewing || Builder.isEditing)) {
    return <BuilderComponent model={model} />;
  }
  return null;
}
