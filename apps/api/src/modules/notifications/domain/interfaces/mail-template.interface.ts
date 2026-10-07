import type { Locale } from '@pdas/core';

export interface MailTemplateKey {
    name: string;
    locale: Locale;
}

export interface MailTemplateContent {
    subject: string;
    html: string;
    text: string | null;
}

export interface MailTemplateProps extends MailTemplateKey, MailTemplateContent {
    updatedBy: string;
    updatedAt: Date;
}

export type MailTemplateSummary = Pick<
    MailTemplateProps,
    'name' | 'locale' | 'subject' | 'updatedAt'
>;
