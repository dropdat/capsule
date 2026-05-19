import type { Metadata } from "next";
import { MarketingHome } from "@/components/MarketingHome";
import { getDict } from "@/i18n/dictionaries";
import { localeMetadata } from "@/i18n/metadata";

export const metadata: Metadata = localeMetadata("es", "/");

export default function HomeEs() {
  return <MarketingHome dict={getDict("es")} locale="es" />;
}
