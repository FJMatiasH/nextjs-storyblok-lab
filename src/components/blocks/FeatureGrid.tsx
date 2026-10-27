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
        <div className="feature-grid__items" role="list">
          {features.map((feature) => (
            <StoryblokServerComponent
              key={feature._uid}
              blok={feature}
              hasSectionTitle={hasTitle}
              isInGrid
            />
          ))}
        </div>
      )}
    </section>
  );
}
