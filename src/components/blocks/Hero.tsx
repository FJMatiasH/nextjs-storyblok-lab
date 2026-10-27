import Image from "next/image";
import { storyblokEditable } from "@storyblok/react/rsc";
import { resolveStoryblokHref, type StoryblokLink } from "@/lib/site";

type HeroBlock = {
  _uid: string;
  _editable?: string;
  headline?: string;
  text?: string;
  image?: {
    filename?: string;
    alt?: string;
  };
  cta_text?: string;
  cta_link?: StoryblokLink;
};

export default function Hero({
  blok,
  isPageHeading = true,
}: {
  blok: HeroBlock;
  // Set by Page: only the first hero with a headline is the page's h1.
  isPageHeading?: boolean;
}) {
  const headline = blok.headline?.trim();
  const Heading = isPageHeading ? "h1" : "h2";
  const href = resolveStoryblokHref(blok.cta_link);
  const imageSrc = blok.image?.filename;
  const imageAlt = blok.image?.alt?.trim();
  const hasImage = Boolean(imageSrc && imageAlt);

  return (
    <section
      className={hasImage ? "hero hero--with-image" : "hero"}
      {...storyblokEditable(blok)}
    >
      <div className="hero__content">
        {headline && <Heading>{headline}</Heading>}
        {blok.text && <p>{blok.text}</p>}
        {href && blok.cta_text && (
          <a className="button" href={href}>
            {blok.cta_text}
          </a>
        )}
      </div>
      {imageSrc && imageAlt && (
        <div className="hero__image">
          <Image
            src={imageSrc}
            alt={imageAlt}
            // 16:10 matches the CSS aspect-ratio, so no layout shift.
            width={1200}
            height={750}
            // Column width: full width minus 1rem gutters on mobile; half of
            // the content (2rem gutters, 3rem gap) from 48rem; fixed from 80rem.
            sizes="(min-width: 80rem) 584px, (min-width: 48rem) calc(50vw - 56px), calc(100vw - 32px)"
            // The LCP image; `priority` is deprecated in Next 16.
            preload
          />
        </div>
      )}
    </section>
  );
}
