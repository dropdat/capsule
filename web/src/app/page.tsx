import type { Metadata } from "next";
import { MarketingHome } from "@/components/MarketingHome";
import { AutoLocaleRedirect } from "@/components/AutoLocaleRedirect";
import { getDict } from "@/i18n/dictionaries";
import { localeMetadata } from "@/i18n/metadata";

export const metadata: Metadata = localeMetadata("en", "/");

export default function Home() {
  return (
    <>
      <AutoLocaleRedirect />
      <MarketingHome dict={getDict("en")} locale="en" />
    </>
  );
}
