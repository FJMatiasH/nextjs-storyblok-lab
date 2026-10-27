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
