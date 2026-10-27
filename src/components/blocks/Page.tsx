import {
  StoryblokServerComponent,
  storyblokEditable,
  type SbBlokData,
} from "@storyblok/react/rsc";
import { findHeadingHeroUid } from "@/lib/page-heading";

type PageBlock = {
  _uid: string;
  _editable?: string;
  body?: SbBlokData[];
};

export default function Page({ blok }: { blok: PageBlock }) {
  const headingHeroUid = findHeadingHeroUid(blok.body);

  return (
    <div {...storyblokEditable(blok)}>
      {blok.body?.map((child) =>
        child.component === "hero" ? (
          <StoryblokServerComponent
            key={child._uid}
            blok={child}
            isPageHeading={child._uid === headingHeroUid}
          />
        ) : (
          <StoryblokServerComponent key={child._uid} blok={child} />
        ),
      )}
    </div>
  );
}
