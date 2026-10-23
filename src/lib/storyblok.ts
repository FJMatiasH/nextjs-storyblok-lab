import { createElement } from "react";
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
