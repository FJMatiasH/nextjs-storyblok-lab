export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Maps URL segments to a Storyblok slug: /en -> en/home, /en/about -> en/about. */
export function toStoryblokSlug(locale: Locale, slug?: string[]): string {
  return `${locale}/${slug?.length ? slug.join("/") : "home"}`;
}
