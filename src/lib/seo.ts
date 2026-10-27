import type { Metadata } from "next";
import type { ISbStoryData } from "@storyblok/react/rsc";
import { locales, type Locale } from "@/lib/i18n";
import {
  getLocaleAlternates,
  getSiteUrl,
  ogLocales,
  siteDescriptions,
  siteName,
  toHreflangLanguages,
  toSitePath,
} from "@/lib/site";

type SeoImage = { url: string; alt: string; width?: number; height?: number };

const storyblokAssetHost = /^https:\/\/a(-[a-z]+|\d*)\.storyblok\.com\//;

function readString(content: unknown, key: string): string | undefined {
  if (typeof content !== "object" || content === null || !(key in content)) {
    return undefined;
  }
  const value: unknown = (content as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readOgImage(content: unknown, fallbackAlt: string): SeoImage | undefined {
  if (typeof content !== "object" || content === null || !("og_image" in content)) {
    return undefined;
  }
  const asset = content.og_image;
  const url = readString(asset, "filename");
  if (!url) return undefined;

  const alt = readString(asset, "alt") ?? fallbackAlt;

  // Storyblok's image service crops rasters to the 1200x630 Open Graph size;
  // SVG, GIF and other hosts are used as-is, without claiming a size.
  const canResize =
    storyblokAssetHost.test(url) && !/\.(svg|gif)$/i.test(url);
  return canResize
    ? { url: `${url}/m/1200x630/smart`, alt, width: 1200, height: 630 }
    : { url, alt };
}

export function buildPageMetadata({
  locale,
  slug,
  story,
  publishedSlugs,
}: {
  locale: Locale;
  slug?: string[];
  story: ISbStoryData;
  publishedSlugs: ReadonlySet<string>;
}): Metadata {
  const pathWithoutLocale = slug?.join("/") ?? "";
  const isHome = pathWithoutLocale === "" || pathWithoutLocale === "home";
  const canonical = toSitePath(`${locale}/${pathWithoutLocale || "home"}`);

  const seoTitle = readString(story.content, "seo_title");
  // Home falls back to the brand name alone; other pages to the story name.
  const title = seoTitle ?? (isHome ? siteName : story.name || siteName);
  const description =
    readString(story.content, "seo_description") ?? siteDescriptions[locale];
  const image = readOgImage(story.content, title);

  const alternates = getLocaleAlternates(pathWithoutLocale, publishedSlugs);
  // Always self-reference, even if the links list is stale.
  alternates[locale] = canonical;

  return {
    // Absolute on home so it is not "Northlight | Northlight".
    title: isHome && !seoTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: toHreflangLanguages(alternates),
    },
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url: canonical,
      locale: ogLocales[locale],
      alternateLocale: locales
        .filter((other) => other !== locale && alternates[other])
        .map((other) => ogLocales[other]),
      images: image ? [image] : undefined,
    },
    // Next does not derive twitter:* tags from openGraph.
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
  };
}

export function organizationJsonLd(locale: Locale): string {
  const siteUrl = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    // One entity for both locale home pages.
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
    description: siteDescriptions[locale],
  };

  // Escape "<" so story or env text can never close the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
