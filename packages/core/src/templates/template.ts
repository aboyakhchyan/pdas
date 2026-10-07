import { z } from 'zod';
import { localizedTextSchema } from '../constants/locale';
import { blueprintSchema } from '../documents/blueprint';

export const templateIdSchema = z
    .string()
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export const publishTemplateVersionSchema = z.object({
    title: localizedTextSchema,
    blueprint: blueprintSchema,
});
export type PublishTemplateVersionInput = z.infer<typeof publishTemplateVersionSchema>;

export const templateVersionSchema = z.object({
    templateId: templateIdSchema,
    version: z.int().positive(),
    title: localizedTextSchema,
    blueprint: blueprintSchema,
    publishedAt: z.iso.datetime(),
    publishedBy: z.string(),
});
export type TemplateVersionDto = z.infer<typeof templateVersionSchema>;
