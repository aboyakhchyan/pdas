import { z } from 'zod';
import { localeSchema } from '../constants/locale';

const MAX_TEMPLATE_BODY_LENGTH = 200_000;

export const mailTemplateNameSchema = z
    .string()
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export const upsertMailTemplateSchema = z.object({
    subject: z.string().trim().min(1).max(300),
    html: z.string().min(1).max(MAX_TEMPLATE_BODY_LENGTH),
    text: z.string().min(1).max(MAX_TEMPLATE_BODY_LENGTH).optional(),
});
export type UpsertMailTemplateInput = z.infer<typeof upsertMailTemplateSchema>;

export const sendTestMailSchema = z.object({
    data: z.record(z.string(), z.json()).default({}),
});
export type SendTestMailInput = z.infer<typeof sendTestMailSchema>;

export const mailTemplateSchema = z.object({
    name: mailTemplateNameSchema,
    locale: localeSchema,
    subject: z.string(),
    html: z.string(),
    text: z.string().nullable(),
    updatedBy: z.string(),
    updatedAt: z.iso.datetime(),
});
export type MailTemplateDto = z.infer<typeof mailTemplateSchema>;

export const mailTemplateSummarySchema = mailTemplateSchema.pick({
    name: true,
    locale: true,
    subject: true,
    updatedAt: true,
});
export type MailTemplateSummaryDto = z.infer<typeof mailTemplateSummarySchema>;
