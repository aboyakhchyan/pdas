import { Injectable } from '@nestjs/common';
import { NotFoundError } from '@common/errors/domain-error';
import type { MailTemplateKey } from '../../domain/interfaces/mail-template.interface';
import { MailTemplateRepository } from '../../domain/ports/mail-template.repository';

@Injectable()
export class DeleteMailTemplate {
    constructor(private readonly templates: MailTemplateRepository) {}

    async execute(key: MailTemplateKey): Promise<void> {
        if (!(await this.templates.find(key))) throw new NotFoundError();
        await this.templates.delete(key);
    }
}
