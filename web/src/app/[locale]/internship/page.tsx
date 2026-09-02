import { notFound } from "next/navigation";

import InternshipPage from "../../internship/page";
import { LOCALES, type Locale } from "@/i18n/config";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default function LocalizedInternshipPage({ params }: { params: { locale: string } }) {
  if (!LOCALES.includes(params.locale as Locale)) notFound();
  return <InternshipPage />;
}
