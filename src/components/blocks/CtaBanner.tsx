import { storyblokEditable } from "@storyblok/react/rsc";

type StoryblokLink = {
  url?: string;
  cached_url?: string;
};

type CtaBannerBlock = {
  _uid: string;
  _editable?: string;
  title?: string;
  text?: string;
  button_text?: string;
  button_link?: StoryblokLink | string;
};

function getHref(link: CtaBannerBlock["button_link"]): string | undefined {
  if (typeof link === "string") return link;
  return link?.url || link?.cached_url;
}

export default function CtaBanner({ blok }: { blok: CtaBannerBlock }) {
  const href = getHref(blok.button_link);

  return (
    <section className="cta-banner" {...storyblokEditable(blok)}>
      {blok.title && <h2>{blok.title}</h2>}
      {blok.text && <p>{blok.text}</p>}
      {href && blok.button_text && (
        <a className="button button--secondary" href={href}>
          {blok.button_text}
        </a>
      )}
    </section>
  );
}
