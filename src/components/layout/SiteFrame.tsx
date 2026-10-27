import Link from "next/link";
import { Geist } from "next/font/google";
import { localeLabels, locales, type Locale } from "@/lib/i18n";
import { siteName } from "@/lib/site";

// Self-hosted by next/font with a size-adjusted fallback, so the swap from
// the fallback to Geist does not shift layout.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const frameLabels: Record<
  Locale,
  { skip: string; language: string; footer: string }
> = {
  en: {
    skip: "Skip to main content",
    language: "Language",
    footer: `${siteName}. Modern tools for small teams.`,
  },
  es: {
    skip: "Saltar al contenido principal",
    language: "Idioma",
    footer: `${siteName}. Herramientas modernas para equipos pequeños.`,
  },
};

export default function SiteFrame({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: Locale;
}) {
  return (
    <html
      lang={lang}
      className={geistSans.variable}
    >
      <body>
        <a className="skip-link" href="#main-content">
          {frameLabels[lang].skip}
        </a>
        <header className="site-header">
          <Link className="site-brand" href={`/${lang}`}>
            {siteName}
          </Link>
          <nav aria-label={frameLabels[lang].language}>
            <ul className="language-nav">
              {locales.map((locale) => (
                <li key={locale}>
                  <Link
                    href={`/${locale}`}
                    hrefLang={locale}
                    lang={locale}
                    aria-current={locale === lang ? "true" : undefined}
                  >
                    {localeLabels[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main id="main-content">{children}</main>
        <footer className="site-footer">
          <p>{frameLabels[lang].footer}</p>
        </footer>
      </body>
    </html>
  );
}
