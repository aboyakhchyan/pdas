export const LOCALES = ["hy", "ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "hy";
