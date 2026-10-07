import type { MailTemplate } from '../entities/mail-template.entity';
import type { MailTemplateKey, MailTemplateSummary } from '../interfaces/mail-template.interface';

export abstract class MailTemplateRepository {
    abstract find(key: MailTemplateKey): Promise<MailTemplate | null>;
    abstract list(): Promise<MailTemplateSummary[]>;
    abstract save(template: MailTemplate): Promise<void>;
    abstract delete(key: MailTemplateKey): Promise<void>;
}
