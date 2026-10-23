import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { isLocale } from "@/lib/i18n";
import {
  getLocaleAlternates,
  getSiteUrl,
  toHreflangLanguages,
  toSitePath,
} from "@/lib/site";
import { fetchPublishedLinks } from "@/lib/storyblok";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Built per request for now; the caching task should move this to "use cache".
  await connection();

  const siteUrl = getSiteUrl();
  const links = await fetchPublishedLinks();
  const publishedSlugs = new Set(links.map((link) => link.fullSlug));

  return links.flatMap((link) => {
    const [locale, ...rest] = link.fullSlug.split("/");
    if (!locale || !isLocale(locale) || rest.length === 0) return [];

    const pathWithoutLocale = rest.join("/") === "home" ? "" : rest.join("/");
    const languages = toHreflangLanguages(
      getLocaleAlternates(pathWithoutLocale, publishedSlugs),
    );

    return [
      {
        url: `${siteUrl}${toSitePath(link.fullSlug)}`,
        lastModified: link.publishedAt ? new Date(link.publishedAt) : undefined,
        alternates: {
          languages: Object.fromEntries(
            Object.entries(languages).map(([lang, path]) => [
              lang,
              `${siteUrl}${path}`,
            ]),
          ),
        },
      },
    ];
  });
}
