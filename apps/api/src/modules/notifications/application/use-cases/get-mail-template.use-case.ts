import { Injectable } from '@nestjs/common';
import { NotFoundError } from '@common/errors/domain-error';
import type { MailTemplate } from '../../domain/entities/mail-template.entity';
import type { MailTemplateKey } from '../../domain/interfaces/mail-template.interface';
import { MailTemplateRepository } from '../../domain/ports/mail-template.repository';

@Injectable()
export class GetMailTemplate {
    constructor(private readonly templates: MailTemplateRepository) {}

    async execute(key: MailTemplateKey): Promise<MailTemplate> {
        const template = await this.templates.find(key);
        if (!template) throw new NotFoundError();
        return template;
    }
}
