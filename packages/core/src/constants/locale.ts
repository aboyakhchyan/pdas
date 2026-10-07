import { z } from 'zod';

export const LOCALES = ['hy', 'en', 'ru'] as const;
export const localeSchema = z.enum(LOCALES);
export type Locale = z.infer<typeof localeSchema>;
export const DEFAULT_LOCALE: Locale = 'hy';

export const localizedTextSchema = z.object({
    hy: z.string().trim().min(1).max(500),
    en: z.string().trim().min(1).max(500),
    ru: z.string().trim().min(1).max(500),
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;
