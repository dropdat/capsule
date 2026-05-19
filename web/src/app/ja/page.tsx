import type { Metadata } from "next";
import { MarketingHome } from "@/components/MarketingHome";
import { getDict } from "@/i18n/dictionaries";
import { localeMetadata } from "@/i18n/metadata";

export const metadata: Metadata = localeMetadata("ja", "/");

export default function HomeJa() {
  return <MarketingHome dict={getDict("ja")} locale="ja" />;
}
