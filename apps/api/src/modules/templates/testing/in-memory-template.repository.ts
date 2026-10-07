import type {
    TemplateVersion,
    TemplateVersionDraft,
} from '../domain/interfaces/template-version.interface';
import { TemplateRepository } from '../domain/ports/template.repository';

export class InMemoryTemplateRepository extends TemplateRepository {
    private readonly versions: TemplateVersion[] = [];

    async publish(draft: TemplateVersionDraft, publishedAt: Date): Promise<TemplateVersion> {
        const latest = await this.findLatest(draft.templateId);
        const template = { ...draft, version: (latest?.version ?? 0) + 1, publishedAt };
        this.versions.push(template);
        return template;
    }

    async findVersion(templateId: string, version: number): Promise<TemplateVersion | null> {
        return (
            this.versions.find((t) => t.templateId === templateId && t.version === version) ?? null
        );
    }

    async findLatest(templateId: string): Promise<TemplateVersion | null> {
        return this.versions.filter((t) => t.templateId === templateId).at(-1) ?? null;
    }
}
