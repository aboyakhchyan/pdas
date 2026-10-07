import { MailTemplate } from '../domain/entities/mail-template.entity';
import type {
    MailTemplateKey,
    MailTemplateSummary,
} from '../domain/interfaces/mail-template.interface';
import { MailTemplateRepository } from '../domain/ports/mail-template.repository';

export class InMemoryMailTemplateRepository extends MailTemplateRepository {
    readonly templates = new Map<string, MailTemplate>();

    async find(key: MailTemplateKey): Promise<MailTemplate | null> {
        const stored = this.templates.get(idOf(key));
        return stored ? MailTemplate.restore(stored.toProps()) : null;
    }

    async list(): Promise<MailTemplateSummary[]> {
        return [...this.templates.values()].map((template) => {
            const { name, locale, subject, updatedAt } = template.toProps();
            return { name, locale, subject, updatedAt };
        });
    }

    async save(template: MailTemplate): Promise<void> {
        this.templates.set(idOf(template.key), MailTemplate.restore(template.toProps()));
    }

    async delete(key: MailTemplateKey): Promise<void> {
        this.templates.delete(idOf(key));
    }
}

function idOf({ name, locale }: MailTemplateKey): string {
    return `${name}.${locale}`;
}
