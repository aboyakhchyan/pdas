import type { TemplateVersionDto } from '@pdas/core';
import type { TemplateVersion } from '../../domain/interfaces/template-version.interface';

export function toTemplateVersionDto(template: TemplateVersion): TemplateVersionDto {
    return { ...template, publishedAt: template.publishedAt.toISOString() };
}
