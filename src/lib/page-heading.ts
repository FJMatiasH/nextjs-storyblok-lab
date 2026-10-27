// Shared by the route (hidden fallback h1) and the Page block (which hero
// renders the h1), so both always agree on where the page heading comes from.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * The _uid of the hero that renders the page's h1: the first hero block with
 * a non-blank headline. Later heroes render h2; with none, the route renders
 * a visually hidden h1 instead.
 */
export function findHeadingHeroUid(body: unknown): string | undefined {
  if (!Array.isArray(body)) return undefined;

  for (const blok of body) {
    if (
      isRecord(blok) &&
      blok.component === "hero" &&
      typeof blok._uid === "string" &&
      typeof blok.headline === "string" &&
      blok.headline.trim()
    ) {
      return blok._uid;
    }
  }

  return undefined;
}
