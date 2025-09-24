"use client";
import React from "react";
import Image from "next/image";

type ImageInput = string | { src?: string; image?: string } | null | undefined;

function getImageUrl(img: ImageInput): string | undefined {
  if (!img) return undefined;
  if (typeof img === "string") return img;
  if (img && typeof img === "object") {
    const obj = img as Record<string, unknown>;
    if (typeof obj.src === "string") return obj.src as string;
    if (typeof obj.image === "string") return obj.image as string;
  }
  return undefined;
}

export interface CardFeatureProps {
  text: string;
  image?: ImageInput;
  imageAlignment?: "left" | "right";
}

export default function CardFeature({ text, image, imageAlignment = "left" }: CardFeatureProps) {
  const url = getImageUrl(image);
  const isRight = imageAlignment === "right";

  return (
    <section className="card-feature px-4 py-6">
      <div className={`mx-auto max-w-5xl flex flex-col md:flex-row ${isRight ? "md:flex-row-reverse" : ""} gap-6 items-center`}>
        {url ? (
          <div className="w-full md:w-1/2">
            <Image src={url} alt="" width={1200} height={630} sizes="100vw" unoptimized className="w-full h-auto rounded-md object-cover" />
          </div>
        ) : null}
        <div className="w-full md:w-1/2">
          <p className="text-lg leading-relaxed">{text}</p>
        </div>
      </div>
    </section>
  );
}
