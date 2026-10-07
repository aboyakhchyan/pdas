import type { OutgoingMail } from '../domain/interfaces/outgoing-mail.interface';
import { MailOutbox } from '../domain/ports/mail-outbox.port';

export class InMemoryMailOutbox extends MailOutbox {
    readonly sent: OutgoingMail[] = [];

    async enqueue(mail: OutgoingMail): Promise<void> {
        this.sent.push(mail);
    }
}
