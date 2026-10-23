import { createElement } from "react";
import { cacheLife, cacheTag } from "next/cache";
import {
  apiPlugin,
  storyblokInit,
  type SbBlokData,
  type ISbStoryData,
} from "@storyblok/react/rsc";
import CtaBanner from "@/components/blocks/CtaBanner";
import ContactForm from "@/components/blocks/ContactForm";
import Feature from "@/components/blocks/Feature";
import FeatureGrid from "@/components/blocks/FeatureGrid";
import Hero from "@/components/blocks/Hero";
import Page from "@/components/blocks/Page";

const storyblokToken = process.env.STORYBLOK_TOKEN?.trim();
const storyblokPreviewToken = process.env.STORYBLOK_PREVIEW_TOKEN?.trim();

function UnknownBlock({ blok }: { blok: SbBlokData }) {
  if (process.env.NODE_ENV !== "development") return null;

  return createElement("p", null, "Unknown Storyblok block: ", blok.component);
}

const getStoryblokApi = storyblokInit({
  accessToken: storyblokToken,
  use: [apiPlugin],
  // Next's cache ("use cache") owns freshness. With the default cv "auto" the
  // client re-sends the last cache version it saw, so a revalidated page would
  // refetch the same stale CDN response.
  apiOptions: { cache: { clear: "manual", type: "none", cv: "manual" } },
  enableFallbackComponent: true,
  customFallbackComponent: UnknownBlock,
  components: {
    page: Page,
    hero: Hero,
    feature_grid: FeatureGrid,
    feature: Feature,
    cta_banner: CtaBanner,
    contact_form: ContactForm,
  },
});

type FetchStoryOptions = {
  preview?: boolean;
};

/** Published content is cached for an hour and refreshed early by the webhook. */
const publishedCacheLife = { revalidate: 3600 };

/** Tag of one story; the webhook revalidates it by the story's full_slug. */
export function storyTag(fullSlug: string): string {
  return `story:${fullSlug.replace(/^\/+|\/+$/g, "")}`;
}

/** Tag of the links list (sitemap, hreflang); any publish can change it. */
export const linksTag = "storyblok:links";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorDetails(error: unknown): {
  status?: number;
  message: string;
} {
  if (error instanceof Error) {
    const status =
      isRecord(error) && typeof error.status === "number"
        ? error.status
        : undefined;
    const response = isRecord(error) && isRecord(error.response)
      ? error.response
      : undefined;

    return {
      status:
        status ??
        (response && typeof response.status === "number"
          ? response.status
          : undefined),
      message: error.message,
    };
  }

  if (isRecord(error)) {
    const response = isRecord(error.response) ? error.response : undefined;

    return {
      status:
        (typeof error.status === "number" ? error.status : undefined) ??
        (response && typeof response.status === "number"
          ? response.status
          : undefined),
      message:
        typeof error.message === "string" ? error.message : String(error),
    };
  }

  return { message: String(error) };
}

export async function fetchStory(
  slug: string,
  options: FetchStoryOptions = {},
): Promise<ISbStoryData | null> {
  // Draft content must never be cached, so it skips the "use cache" layer.
  return options.preview
    ? requestStory(slug, { preview: true })
    : fetchPublishedStory(slug);
}

async function fetchPublishedStory(slug: string): Promise<ISbStoryData | null> {
  "use cache";
  cacheLife(publishedCacheLife);
  cacheTag(storyTag(slug));

  return requestStory(slug, { preview: false });
}

async function requestStory(
  slug: string,
  options: FetchStoryOptions,
): Promise<ISbStoryData | null> {
  const token = options.preview ? storyblokPreviewToken : storyblokToken;
  const tokenName = options.preview
    ? "STORYBLOK_PREVIEW_TOKEN"
    : "STORYBLOK_TOKEN";

  if (!token) {
    throw new Error(
      `Missing ${tokenName}. Set this environment variable to fetch the Storyblok story "${slug}".`,
    );
  }

  try {
    const response = await getStoryblokApi().getStory(slug, {
      token,
      version: options.preview ? "draft" : "published",
    });

    return response.data.story;
  } catch (error: unknown) {
    const details = getErrorDetails(error);

    if (details.status === 404) {
      return null;
    }

    const status = details.status ? ` (HTTP ${details.status})` : "";
    throw new Error(
      `Failed to fetch Storyblok story "${slug}"${status}: ${details.message}`,
    );
  }
}

export type PublishedLink = {
  fullSlug: string;
  publishedAt?: string;
};

/** Every published story (folders excluded) from the Storyblok links endpoint. */
export async function fetchPublishedLinks(): Promise<PublishedLink[]> {
  "use cache";
  cacheLife(publishedCacheLife);
  cacheTag(linksTag);

  if (!storyblokToken) {
    throw new Error(
      "Missing STORYBLOK_TOKEN. Set this environment variable to fetch Storyblok links.",
    );
  }

  const perPage = 1000;

  try {
    const links = [];
    // Large spaces are capped per request, so read page by page.
    for (let page = 1; ; page++) {
      const response = await getStoryblokApi().get("cdn/links", {
        version: "published",
        include_dates: 1,
        paginated: 1,
        per_page: perPage,
        page,
      });
      const pageLinks = Object.values(response.data.links ?? {});
      links.push(...pageLinks);
      if (pageLinks.length < perPage) break;
    }

    return links.flatMap((link) =>
      link.slug && !link.is_folder && link.published !== false
        ? [{ fullSlug: link.slug, publishedAt: link.published_at }]
        : [],
    );
  } catch (error: unknown) {
    const details = getErrorDetails(error);
    const status = details.status ? ` (HTTP ${details.status})` : "";
    throw new Error(
      `Failed to fetch Storyblok links${status}: ${details.message}`,
    );
  }
}
