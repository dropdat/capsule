import type { Metadata } from "next";
import { MarketingHome } from "@/components/MarketingHome";
import { getDict } from "@/i18n/dictionaries";
import { localeMetadata } from "@/i18n/metadata";

export const metadata: Metadata = localeMetadata("de", "/");

export default function HomeDe() {
  return <MarketingHome dict={getDict("de")} locale="de" />;
}
