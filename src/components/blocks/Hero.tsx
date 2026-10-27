import Image from "next/image";
import { storyblokEditable } from "@storyblok/react/rsc";

type StoryblokLink = {
  url?: string;
  cached_url?: string;
};

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
  cta_link?: StoryblokLink | string;
};

function getHref(link: HeroBlock["cta_link"]): string | undefined {
  if (typeof link === "string") return link;
  return link?.url || link?.cached_url;
}

export default function Hero({ blok }: { blok: HeroBlock }) {
  const href = getHref(blok.cta_link);
  const imageSrc = blok.image?.filename;
  const imageAlt = blok.image?.alt?.trim();
  const hasImage = Boolean(imageSrc && imageAlt);

  return (
    <section
      className={hasImage ? "hero hero--with-image" : "hero"}
      {...storyblokEditable(blok)}
    >
      <div className="hero__content">
        {blok.headline && <h1>{blok.headline}</h1>}
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
            width={1200}
            height={750}
            sizes="(min-width: 48rem) 50vw, 100vw"
            priority
          />
        </div>
      )}
    </section>
  );
}
