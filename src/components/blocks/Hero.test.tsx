import { render, screen } from "@testing-library/react";
import Hero from "@/components/blocks/Hero";

describe("Hero", () => {
  it("shows the headline as the page heading and a CTA to the linked story", () => {
    render(
      <Hero
        blok={{
          _uid: "hero-1",
          headline: "Teamwork made simple",
          text: "Plan, run and track your projects.",
          cta_text: "See plans",
          // Shape of a Storyblok multilink pointing at a story.
          cta_link: { linktype: "story", url: "", cached_url: "en/plans" },
        }}
        isPageHeading
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Teamwork made simple" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "See plans" }),
    ).toHaveAttribute("href", "/en/plans");
  });

  it("uses a level-2 heading unless it is the page heading", () => {
    render(<Hero blok={{ _uid: "hero-2", headline: "Second hero" }} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Second hero" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("renders no heading for a blank headline", () => {
    render(<Hero blok={{ _uid: "hero-3", headline: "   " }} isPageHeading />);

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
