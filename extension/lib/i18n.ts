/**
 * Wrapper around `chrome.i18n.getMessage` so callers can use t("key", subs).
 *
 * Chrome selects the locale from the browser UI language and falls back to
 * `default_locale` in the manifest when an exact match is missing. Translation
 * tables live in `public/_locales/{lang}/messages.json`.
 */
export function t(key: string, substitutions?: string | string[]): string {
  if (typeof chrome === "undefined" || !chrome.i18n?.getMessage) return key;
  const msg = chrome.i18n.getMessage(key, substitutions as string | string[] | undefined);
  return msg || key;
}
