import {
  StoryblokServerComponent,
  storyblokEditable,
  type SbBlokData,
} from "@storyblok/react/rsc";

type PageBlock = {
  _uid: string;
  _editable?: string;
  body?: SbBlokData[];
};

export default function Page({ blok }: { blok: PageBlock }) {
  return (
    <div {...storyblokEditable(blok)}>
      {blok.body?.map((child) => (
        <StoryblokServerComponent key={child._uid} blok={child} />
      ))}
    </div>
  );
}
