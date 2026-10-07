import { type Locale, localeSchema, mailTemplateNameSchema } from '@pdas/core';
import { ContractField } from '@common/decorators/contract.decorator';
import type { MailTemplateKey } from '../../domain/interfaces/mail-template.interface';

export class MailTemplateParams implements MailTemplateKey {
    @ContractField(mailTemplateNameSchema)
    name: string;

    @ContractField(localeSchema)
    locale: Locale;
}
