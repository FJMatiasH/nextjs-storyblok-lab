import {
  StoryblokServerComponent,
  storyblokEditable,
  type SbBlokData,
} from "@storyblok/react/rsc";

type FeatureGridBlock = {
  _uid: string;
  _editable?: string;
  title?: string;
  features?: SbBlokData[];
};

export default function FeatureGrid({ blok }: { blok: FeatureGridBlock }) {
  const hasTitle = Boolean(blok.title?.trim());
  const features = blok.features ?? [];

  return (
    <section className="feature-grid" {...storyblokEditable(blok)}>
      {hasTitle && <h2>{blok.title}</h2>}
      {features.length > 0 && (
        // role="list": Safari drops list semantics when list-style is none.
        // Each block is wrapped in an li, so any block type an editor drops
        // into the grid is still a valid list item.
        <ul className="feature-grid__items" role="list">
          {features.map((feature) => (
            <li key={feature._uid}>
              <StoryblokServerComponent
                blok={feature}
                hasSectionTitle={hasTitle}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
