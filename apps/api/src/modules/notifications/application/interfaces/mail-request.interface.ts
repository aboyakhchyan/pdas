import type { Locale } from '@pdas/core';

export interface MailRequest {
    to: string | string[];
    /** Template name, e.g. `document-ready`; its subject and body come from the template store. */
    template: string;
    /** Recipient's language; falls back to the default locale when no translation exists. */
    locale: Locale;
    /** Values for the template placeholders (Handlebars). */
    data?: Record<string, unknown>;
    replyTo?: string;
}
