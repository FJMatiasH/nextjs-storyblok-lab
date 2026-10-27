import { render, screen, within } from "@testing-library/react";
// Initialises the real Storyblok component registry used by FeatureGrid.
import "@/lib/storyblok";
import FeatureGrid from "@/components/blocks/FeatureGrid";

const features = [
  { _uid: "f1", component: "feature", title: "Fast setup", icon: "bolt" },
  { _uid: "f2", component: "feature", title: "Projects in one place", icon: "map" },
  { _uid: "f3", component: "feature", title: "Fair prices", icon: "euro" },
];

describe("FeatureGrid", () => {
  it("renders one list item per feature", () => {
    render(
      <FeatureGrid
        blok={{ _uid: "grid-1", title: "Why Northlight", features }}
      />,
    );

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(features.length);

    features.forEach((feature, index) => {
      // Under a section title the features are level-3 headings.
      expect(
        within(items[index]).getByRole("heading", {
          level: 3,
          name: feature.title,
        }),
      ).toBeInTheDocument();
    });
  });

  it("wraps a CTA banner placed among the features in a list item", () => {
    const banner = {
      _uid: "b1",
      component: "cta_banner",
      title: "Talk to us",
      button_text: "Contact",
      button_link: { linktype: "url", url: "https://example.com/contact" },
    };

    render(
      <FeatureGrid
        blok={{
          _uid: "grid-2",
          title: "Why Northlight",
          features: [...features, banner],
        }}
      />,
    );

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(features.length + 1);
    // Every direct child of the list must be a list item (axe
    // aria-required-children).
    Array.from(list.children).forEach((child) => {
      expect(child).toHaveAttribute("role", "listitem");
    });
    expect(
      within(items[features.length]).getByRole("heading", {
        level: 3,
        name: banner.title,
      }),
    ).toBeInTheDocument();
  });
});
