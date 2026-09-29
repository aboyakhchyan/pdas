import { LOCALES, DEFAULT_LOCALE } from "@hyework/shared";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
});
