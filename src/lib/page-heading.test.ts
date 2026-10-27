import { findHeadingHeroUid } from "@/lib/page-heading";

describe("findHeadingHeroUid", () => {
  it("picks the first hero that has a headline", () => {
    const body = [
      { _uid: "grid", component: "feature_grid", title: "Features" },
      { _uid: "blank", component: "hero", headline: "  " },
      { _uid: "first", component: "hero", headline: "Welcome" },
      { _uid: "second", component: "hero", headline: "Also a hero" },
    ];

    expect(findHeadingHeroUid(body)).toBe("first");
  });

  it("returns undefined when no hero has a headline", () => {
    expect(
      findHeadingHeroUid([{ _uid: "cta", component: "cta_banner" }]),
    ).toBeUndefined();
    expect(findHeadingHeroUid(undefined)).toBeUndefined();
  });
});
