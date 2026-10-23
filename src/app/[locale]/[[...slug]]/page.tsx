import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { StoryblokStory } from "@storyblok/react/rsc";
import { isLocale, locales, toStoryblokSlug } from "@/lib/i18n";
import { fetchStory } from "@/lib/storyblok";

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
  const story = await fetchStory(toStoryblokSlug(locale, slug));

  if (!story) notFound();

  return (
    <div className="story-page" lang={locale}>
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
