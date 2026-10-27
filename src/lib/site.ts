import { defaultLocale, locales, type Locale } from "@/lib/i18n";

export const siteName = "Northlight";

export const siteDescriptions: Record<Locale, string> = {
  en: "A bilingual demo site built with Next.js and Storyblok.",
  es: "Un sitio de demostración bilingüe creado con Next.js y Storyblok.",
};

export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
};

/** Absolute base URL from NEXT_PUBLIC_SITE_URL, without a trailing slash. */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (url) return url;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing NEXT_PUBLIC_SITE_URL. Set it to build canonical URLs, the sitemap and robots.txt.",
    );
  }

  return "http://localhost:3000";
}

/** Storyblok full slug to site path: en/home -> /en, en/about -> /en/about. */
export function toSitePath(fullSlug: string): string {
  // Only the locale home ("en/home") maps to the locale root.
  const path = fullSlug.replace(/\/+$/, "").replace(/^([^/]+)\/home$/, "$1");
  return `/${path}`;
}

export type StoryblokLink =
  | string
  | { linktype?: string; url?: string; cached_url?: string }
  | undefined;

/** href for a Storyblok link field; story links become root-relative site paths. */
export function resolveStoryblokHref(link: StoryblokLink): string | undefined {
  if (typeof link === "string") return link || undefined;
  if (!link) return undefined;

  if (link.linktype === "story") {
    return link.cached_url ? toSitePath(link.cached_url) : undefined;
  }

  return link.url || link.cached_url || undefined;
}

/** The same page in every locale, keyed by locale, if its story exists. */
export function getLocaleAlternates(
  pathWithoutLocale: string,
  publishedSlugs: ReadonlySet<string>,
): Partial<Record<Locale, string>> {
  const alternates: Partial<Record<Locale, string>> = {};

  for (const locale of locales) {
    const fullSlug = `${locale}/${pathWithoutLocale || "home"}`;
    if (publishedSlugs.has(fullSlug)) alternates[locale] = toSitePath(fullSlug);
  }

  return alternates;
}

/** hreflang map for Next metadata, with x-default pointing at the default locale. */
export function toHreflangLanguages(
  alternates: Partial<Record<Locale, string>>,
): Record<string, string> {
  const languages: Record<string, string> = { ...alternates };
  const fallback = alternates[defaultLocale];
  if (fallback) languages["x-default"] = fallback;
  return languages;
}
