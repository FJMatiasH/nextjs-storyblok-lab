import { cache, Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
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

// Prerenders each locale home (/en, /es); other slugs render on request.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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

  await connection();
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

async function StoryblokPage({
  params,
}: {
  params: PageProps["params"];
}) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) notFound();

  await connection();
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

export default function Page({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <p className="story-page" role="status">
          Loading page content...
        </p>
      }
    >
      <StoryblokPage params={params} />
    </Suspense>
  );
}
