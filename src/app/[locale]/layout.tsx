import type { Metadata } from "next";
import SiteFrame from "@/components/layout/SiteFrame";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { getSiteUrl, siteDescriptions, siteName } from "@/lib/site";
import "../globals.css";

// Pages override title and description through generateMetadata.
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescriptions[defaultLocale],
};

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // notFound() in this root layout would skip not-found.tsx and show Next's
  // bare error page, so unknown locales (e.g. /fr) fall back to the default
  // frame here and the page calls notFound().
  const lang = isLocale(locale) ? locale : defaultLocale;

  return <SiteFrame lang={lang}>{children}</SiteFrame>;
}
