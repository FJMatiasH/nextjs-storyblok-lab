import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryblokStory } from "@storyblok/react/rsc";
import { isLocale, locales, toStoryblokSlug } from "@/lib/i18n";
import { buildPageMetadata, organizationJsonLd } from "@/lib/seo";
import { fetchPublishedLinks, fetchStory } from "@/lib/storyblok";

// Deduplicates the Storyblok calls shared by generateMetadata and the page.
const getStory = cache((storySlug: string) => fetchStory(storySlug));
// Only used for hreflang, so a links outage must not break the page.
const getPublishedSlugs = cache(async (): Promise<Set<string>> => {
  try {
    const links = await fetchPublishedLinks();
    return new Set(links.map((link) => link.fullSlug));
  } catch (error: unknown) {
    console.error(error);
    return new Set();
  }
});

// Every page is built from cached Storyblok data, so the whole route can be
// static. It also makes the first request for an unlisted slug wait for the
// finished page instead of streaming a fallback shell with a 200 status, so
// notFound() still sends a real 404.
export const ensureStatic = "navigation";

// Prerenders each locale home (/en, /es); other slugs render on request.
export function generateStaticParams() {
  // slug: [] is the locale root; without it slug stays unknown and even /en
  // is served from the fallback shell.
  return locales.map((locale) => ({ locale, slug: [] }));
}

type PageProps = {
  params: Promise<{
    locale: string;
    slug?: string[];
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const [story, publishedSlugs] = await Promise.all([
    getStory(toStoryblokSlug(locale, slug)),
    getPublishedSlugs(),
  ]);
  if (!story) return {};

  return buildPageMetadata({ locale, slug, story, publishedSlugs });
}

function hasHeroHeading(content: unknown): boolean {
  if (typeof content !== "object" || content === null || !("body" in content)) {
    return false;
  }

  const body = content.body;
  if (!Array.isArray(body)) return false;

  return body.some(
    (blok) =>
      typeof blok === "object" &&
      blok !== null &&
      "component" in blok &&
      blok.component === "hero" &&
      "headline" in blok &&
      typeof blok.headline === "string" &&
      blok.headline.trim().length > 0,
  );
}

// No Suspense boundary: notFound() must run before streaming starts, or the
// response is committed as 200 and only gets a noindex tag (a soft 404).
// The story comes from "use cache", so waiting for it costs little.
export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) notFound();

  const story = await getStory(toStoryblokSlug(locale, slug));

  if (!story) notFound();

  return (
    <div className="story-page" lang={locale}>
      {!slug?.length && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationJsonLd(locale) }}
        />
      )}
      {!hasHeroHeading(story.content) && (
        <h1 className="visually-hidden">{story.name}</h1>
      )}
      <StoryblokStory story={story} />
    </div>
  );
}
