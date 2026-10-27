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

export default function CtaBanner({
  blok,
  hasSectionTitle = false,
  isInGrid = false,
}: {
  blok: CtaBannerBlock;
  // Set by FeatureGrid when an editor places the banner among its features.
  hasSectionTitle?: boolean;
  isInGrid?: boolean;
}) {
  const href = resolveStoryblokHref(blok.button_link);
  const Heading = hasSectionTitle ? "h3" : "h2";

  const section = (
    <section className="cta-banner" {...storyblokEditable(blok)}>
      {blok.title && <Heading>{blok.title}</Heading>}
      {blok.text && <p>{blok.text}</p>}
      {href && blok.button_text && (
        <a className="button button--secondary" href={href}>
          {blok.button_text}
        </a>
      )}
    </section>
  );

  // A section is not a valid child of role="list", so wrap it when the banner
  // was placed inside a feature grid.
  return isInGrid ? <div role="listitem">{section}</div> : section;
}
