import type { OutgoingMail } from '../interfaces/outgoing-mail.interface';

/** Durable queue of emails to send; delivery and retries happen outside the API. */
export abstract class MailOutbox {
    abstract enqueue(mail: OutgoingMail): Promise<void>;
}
