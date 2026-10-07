import type { MailTemplateKey } from './mail-template.interface';

export interface OutgoingMail {
    to: string[];
    template: MailTemplateKey;
    data: Record<string, unknown>;
    replyTo?: string;
}
