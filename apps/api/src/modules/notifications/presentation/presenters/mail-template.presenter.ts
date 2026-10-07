import type { MailTemplateDto, MailTemplateSummaryDto } from '@pdas/core';
import type { MailTemplate } from '../../domain/entities/mail-template.entity';
import type { MailTemplateSummary } from '../../domain/interfaces/mail-template.interface';

export function toMailTemplateDto(template: MailTemplate): MailTemplateDto {
    const { updatedAt, ...props } = template.toProps();
    return { ...props, updatedAt: updatedAt.toISOString() };
}

export function toMailTemplateSummaryDto({
    updatedAt,
    ...summary
}: MailTemplateSummary): MailTemplateSummaryDto {
    return { ...summary, updatedAt: updatedAt.toISOString() };
}
