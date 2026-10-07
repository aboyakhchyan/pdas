export type TranslationPrimitive = string | number | boolean | Date | null | undefined;

export type TranslationValues = Record<string, TranslationPrimitive>;

export type Messages = Record<string, unknown>;
