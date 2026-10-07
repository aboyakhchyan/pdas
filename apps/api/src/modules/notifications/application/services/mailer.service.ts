import { Injectable } from '@nestjs/common';
import { DEFAULT_LOCALE, type Locale } from '@pdas/core';
import { NotFoundError } from '@common/errors/domain-error';
import type { MailTemplateKey } from '../../domain/interfaces/mail-template.interface';
import { MailOutbox } from '../../domain/ports/mail-outbox.port';
import { MailTemplateRepository } from '../../domain/ports/mail-template.repository';
import type { MailRequest } from '../interfaces/mail-request.interface';

/**
 * Public API of the notifications context for sending email. Other contexts call
 * `mailer.send({ to, template, locale, data })`; the message is queued, not sent inline.
 */
@Injectable()
export class Mailer {
    constructor(
        private readonly templates: MailTemplateRepository,
        private readonly outbox: MailOutbox,
    ) {}

    async send({ to, template, locale, data = {}, replyTo }: MailRequest): Promise<void> {
        await this.outbox.enqueue({
            to: [to].flat(),
            template: await this.resolve(template, locale),
            data,
            replyTo,
        });
    }

    private async resolve(name: string, locale: Locale): Promise<MailTemplateKey> {
        for (const candidate of new Set([locale, DEFAULT_LOCALE])) {
            const key = { name, locale: candidate };
            if (await this.templates.find(key)) return key;
        }
        throw new NotFoundError();
    }
}
