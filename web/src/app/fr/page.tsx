import type { Metadata } from "next";
import { MarketingHome } from "@/components/MarketingHome";
import { getDict } from "@/i18n/dictionaries";
import { localeMetadata } from "@/i18n/metadata";

export const metadata: Metadata = localeMetadata("fr", "/");

export default function HomeFr() {
  return <MarketingHome dict={getDict("fr")} locale="fr" />;
}
