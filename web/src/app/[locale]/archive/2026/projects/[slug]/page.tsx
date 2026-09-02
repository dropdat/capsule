import type { Metadata } from "next";
import { notFound } from "next/navigation";

import RootProjectPage, {
  generateStaticParams as rootProjectParams,
} from "../../../../../archive/2026/projects/[slug]/page";
import { LOCALES, type Locale } from "@/i18n/config";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  return LOCALES.flatMap((locale) =>
    rootProjectParams().map(({ slug }) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!LOCALES.includes(locale as Locale)) return {};
  return {
    alternates: { canonical: `/${locale}/archive/2026/projects/${slug}` },
  };
}

export default async function LocalizedProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();
  return <RootProjectPage params={Promise.resolve({ slug })} locale={locale as Locale} />;
}
