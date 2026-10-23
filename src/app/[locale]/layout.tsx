import type { Metadata } from "next";
import SiteFrame from "@/components/layout/SiteFrame";
import { defaultLocale, isLocale } from "@/lib/i18n";
import "../globals.css";

export const metadata: Metadata = {
  title: "chargecloud",
  description: "Discover simple, reliable EV charging with chargecloud.",
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
