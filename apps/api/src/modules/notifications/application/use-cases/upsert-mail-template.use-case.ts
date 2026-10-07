import { Injectable } from '@nestjs/common';
import type { UpsertMailTemplateInput } from '@pdas/core';
import type { Principal } from '@common/interfaces/principal.interface';
import { MailTemplate } from '../../domain/entities/mail-template.entity';
import type { MailTemplateKey } from '../../domain/interfaces/mail-template.interface';
import { MailTemplateRepository } from '../../domain/ports/mail-template.repository';

@Injectable()
export class UpsertMailTemplate {
    constructor(private readonly templates: MailTemplateRepository) {}

    async execute(
        principal: Principal,
        key: MailTemplateKey,
        input: UpsertMailTemplateInput,
    ): Promise<MailTemplate> {
        const content = { ...input, text: input.text ?? null };
        const now = new Date();
        const existing = await this.templates.find(key);

        const template = existing ?? MailTemplate.write(key, content, principal.uid, now);
        if (existing) existing.revise(content, principal.uid, now);

        await this.templates.save(template);
        return template;
    }
}
