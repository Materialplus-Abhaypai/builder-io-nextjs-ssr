"use client";
import { Builder } from "@builder.io/react";
import CardFeature from "@/components/card-feature";


Builder.registerComponent(CardFeature, {
  name: "CardFeature",
  inputs: [
    {
      name: "text",
      type: "text",
      required: true,
      helperText: "Main text content of the card",
    },
    {
      name: "image",
      type: "file",
      allowedFileTypes: ["jpeg", "jpg", "png", "webp", "gif", "svg"],
      helperText: "Optional image for the card",
    },
    {
      name: "imageAlignment",
      type: "string",
      enum: ["left", "right"],
      defaultValue: "left",
      helperText: "Choose whether the image appears on the left or right on desktop",
    },
  ],
});
