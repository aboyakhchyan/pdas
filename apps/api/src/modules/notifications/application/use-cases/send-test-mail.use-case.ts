import { Injectable } from '@nestjs/common';
import type { SendTestMailInput } from '@pdas/core';
import { NotFoundError, RequestInvalidError } from '@common/errors/domain-error';
import type { Principal } from '@common/interfaces/principal.interface';
import type { MailTemplateKey } from '../../domain/interfaces/mail-template.interface';
import { MailOutbox } from '../../domain/ports/mail-outbox.port';
import { MailTemplateRepository } from '../../domain/ports/mail-template.repository';

/** Sends exactly this template (no locale fallback) to the signed-in author for a preview. */
@Injectable()
export class SendTestMail {
    constructor(
        private readonly templates: MailTemplateRepository,
        private readonly outbox: MailOutbox,
    ) {}

    async execute(
        principal: Principal,
        key: MailTemplateKey,
        { data }: SendTestMailInput,
    ): Promise<void> {
        const email = principal.identity.email;
        if (!email) {
            throw new RequestInvalidError([
                { path: ['email'], message: 'The signed-in account has no email address' },
            ]);
        }
        if (!(await this.templates.find(key))) throw new NotFoundError();

        await this.outbox.enqueue({ to: [email], template: key, data });
    }
}
