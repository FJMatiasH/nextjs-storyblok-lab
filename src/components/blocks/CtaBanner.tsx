import { storyblokEditable } from "@storyblok/react/rsc";
import { resolveStoryblokHref, type StoryblokLink } from "@/lib/site";

type CtaBannerBlock = {
  _uid: string;
  _editable?: string;
  title?: string;
  text?: string;
  button_text?: string;
  button_link?: StoryblokLink;
};

export default function CtaBanner({ blok }: { blok: CtaBannerBlock }) {
  const href = resolveStoryblokHref(blok.button_link);

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
