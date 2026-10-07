import { Injectable } from '@nestjs/common';
import type { MailTemplateSummary } from '../../domain/interfaces/mail-template.interface';
import { MailTemplateRepository } from '../../domain/ports/mail-template.repository';

@Injectable()
export class ListMailTemplates {
    constructor(private readonly templates: MailTemplateRepository) {}

    execute(): Promise<MailTemplateSummary[]> {
        return this.templates.list();
    }
}
