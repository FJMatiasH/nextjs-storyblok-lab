"use client";

import type { ImageLoaderProps } from "next/image";

// a.storyblok.com plus regional hosts such as a-us.storyblok.com.
const storyblokAssetHost = /^https:\/\/a(-[a-z]+|\d*)\.storyblok\.com\//;

/**
 * next/image loader for Storyblok assets: the Storyblok image service resizes
 * to each srcset width (height 0 keeps the aspect ratio) and serves WebP or
 * AVIF when the browser accepts it, so images skip the Next.js optimizer.
 * SVGs and other hosts are returned unchanged.
 */
export default function storyblokImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!storyblokAssetHost.test(src) || /\.svg$/i.test(src)) return src;

  return `${src}/m/${width}x0/filters:quality(${quality ?? 75})`;
}
