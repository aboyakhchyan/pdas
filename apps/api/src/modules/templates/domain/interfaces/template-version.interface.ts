import type { Blueprint, LocalizedText } from '@pdas/core';

export interface TemplateVersionDraft {
    templateId: string;
    title: LocalizedText;
    blueprint: Blueprint;
    publishedBy: string;
}

export interface TemplateVersion extends TemplateVersionDraft {
    version: number;
    publishedAt: Date;
}
