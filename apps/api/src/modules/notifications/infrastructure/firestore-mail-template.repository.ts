import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type CollectionReference, Firestore } from 'firebase-admin/firestore';
import type { Configuration } from '@config/interfaces/configuration.interface';
import { MailTemplate } from '../domain/entities/mail-template.entity';
import type {
    MailTemplateKey,
    MailTemplateSummary,
} from '../domain/interfaces/mail-template.interface';
import { MailTemplateRepository } from '../domain/ports/mail-template.repository';
import {
    mailTemplateDocumentId,
    mailTemplateRecordSchema,
    mailTemplateSummaryRecordSchema,
} from './records/mail-template.record';

const MAX_LISTED_TEMPLATES = 500;

/**
 * Stores templates in the collection the Firebase Trigger Email extension renders from
 * (`subject`, `html`, `text` as Handlebars). The extension ignores the extra metadata fields.
 */
@Injectable()
export class FirestoreMailTemplateRepository extends MailTemplateRepository {
    private readonly templates: CollectionReference;

    constructor(firestore: Firestore, config: ConfigService<Configuration, true>) {
        super();
        this.templates = firestore.collection(
            config.get('mail', { infer: true }).templatesCollection,
        );
    }

    async find(key: MailTemplateKey): Promise<MailTemplate | null> {
        const snapshot = await this.templates.doc(mailTemplateDocumentId(key)).get();
        if (!snapshot.exists) return null;
        const { text, ...record } = mailTemplateRecordSchema.parse(snapshot.data());
        return MailTemplate.restore({ ...record, text: text ?? null });
    }

    async list(): Promise<MailTemplateSummary[]> {
        const snapshot = await this.templates
            .select(...mailTemplateSummaryRecordSchema.keyof().options)
            .limit(MAX_LISTED_TEMPLATES)
            .get();
        // The collection is shared with the extension and may hold partials created elsewhere.
        return snapshot.docs
            .map((doc) => mailTemplateSummaryRecordSchema.safeParse(doc.data()))
            .flatMap((result) => (result.success ? [result.data] : []))
            .sort((a, b) => a.name.localeCompare(b.name) || a.locale.localeCompare(b.locale));
    }

    async save(template: MailTemplate): Promise<void> {
        const { text, ...record } = template.toProps();
        await this.templates
            .doc(mailTemplateDocumentId(template.key))
            .set({ ...record, text: text ?? undefined });
    }

    async delete(key: MailTemplateKey): Promise<void> {
        await this.templates.doc(mailTemplateDocumentId(key)).delete();
    }
}
