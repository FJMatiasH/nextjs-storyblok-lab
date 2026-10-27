import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const locales = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

const frameLabels = {
  en: { skip: "Skip to main content", language: "Language" },
  es: { skip: "Saltar al contenido principal", language: "Idioma" },
} as const;

export default function SiteFrame({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: "en" | "es";
}) {
  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">
          {frameLabels[lang].skip}
        </a>
        <header className="site-header">
          <Link className="site-brand" href={`/${lang}`}>
            chargecloud
          </Link>
          <nav aria-label={frameLabels[lang].language}>
            <ul className="language-nav">
              {locales.map((locale) => (
                <li key={locale.code}>
                  <Link
                    href={`/${locale.code}`}
                    hrefLang={locale.code}
                    lang={locale.code}
                    aria-current={locale.code === lang ? "true" : undefined}
                  >
                    {locale.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main id="main-content">{children}</main>
        <footer className="site-footer">
          <p>chargecloud — charging a brighter future.</p>
        </footer>
      </body>
    </html>
  );
}
