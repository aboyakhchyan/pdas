import type {
    TemplateVersion,
    TemplateVersionDraft,
} from '../interfaces/template-version.interface';

export abstract class TemplateRepository {
    abstract publish(draft: TemplateVersionDraft, publishedAt: Date): Promise<TemplateVersion>;
    abstract findVersion(templateId: string, version: number): Promise<TemplateVersion | null>;
    abstract findLatest(templateId: string): Promise<TemplateVersion | null>;
}
