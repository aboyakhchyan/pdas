import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type CollectionReference, FieldValue, Firestore } from 'firebase-admin/firestore';
import type { Configuration, MailConfig } from '@config/interfaces/configuration.interface';
import type { OutgoingMail } from '../domain/interfaces/outgoing-mail.interface';
import { MailOutbox } from '../domain/ports/mail-outbox.port';
import { mailTemplateDocumentId } from './records/mail-template.record';

/**
 * Writes to the collection watched by the Firebase Trigger Email extension, which renders the
 * template, sends it over SMTP, retries and records delivery state on the document.
 */
@Injectable()
export class FirestoreMailOutbox extends MailOutbox {
    private readonly mail: CollectionReference;
    private readonly config: MailConfig;

    constructor(firestore: Firestore, config: ConfigService<Configuration, true>) {
        super();
        this.config = config.get('mail', { infer: true });
        this.mail = firestore.collection(this.config.collection);
    }

    async enqueue({ to, template, data, replyTo }: OutgoingMail): Promise<void> {
        await this.mail.add({
            to,
            from: this.config.from,
            replyTo: replyTo ?? this.config.replyTo,
            template: { name: mailTemplateDocumentId(template), data },
            createdAt: FieldValue.serverTimestamp(),
        });
    }
}
