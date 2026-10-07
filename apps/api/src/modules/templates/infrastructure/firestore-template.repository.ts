import { Injectable } from '@nestjs/common';
import { blueprintSchema } from '@pdas/core';
import { type CollectionReference, Firestore } from 'firebase-admin/firestore';
import type {
    TemplateVersion,
    TemplateVersionDraft,
} from '../domain/interfaces/template-version.interface';
import { TemplateRepository } from '../domain/ports/template.repository';
import { templateHeadRecordSchema, templateVersionRecordSchema } from './records/template.record';

const MAX_CACHED_VERSIONS = 500;

@Injectable()
export class FirestoreTemplateRepository extends TemplateRepository {
    private readonly templates: CollectionReference;
    private readonly cache = new Map<string, TemplateVersion>();

    constructor(private readonly firestore: Firestore) {
        super();
        this.templates = firestore.collection('templates');
    }

    async publish(draft: TemplateVersionDraft, publishedAt: Date): Promise<TemplateVersion> {
        const head = this.templates.doc(draft.templateId);

        const version = await this.firestore.runTransaction(async (transaction) => {
            const snapshot = await transaction.get(head);
            const next = snapshot.exists
                ? templateHeadRecordSchema.parse(snapshot.data()).latestVersion + 1
                : 1;

            transaction.set(head, {
                latestVersion: next,
                title: draft.title,
                updatedAt: publishedAt,
            });
            transaction.create(head.collection('versions').doc(String(next)), {
                title: draft.title,
                blueprintJson: JSON.stringify(draft.blueprint),
                publishedAt,
                publishedBy: draft.publishedBy,
            });
            return next;
        });

        return this.remember({ ...draft, version, publishedAt });
    }

    async findVersion(templateId: string, version: number): Promise<TemplateVersion | null> {
        const cached = this.cache.get(cacheKey(templateId, version));
        if (cached) return cached;

        const snapshot = await this.templates
            .doc(templateId)
            .collection('versions')
            .doc(String(version))
            .get();
        if (!snapshot.exists) return null;

        const { blueprintJson, ...record } = templateVersionRecordSchema.parse(snapshot.data());
        return this.remember({
            templateId,
            version,
            ...record,
            blueprint: blueprintSchema.parse(JSON.parse(blueprintJson)),
        });
    }

    async findLatest(templateId: string): Promise<TemplateVersion | null> {
        const snapshot = await this.templates.doc(templateId).get();
        if (!snapshot.exists) return null;
        return this.findVersion(
            templateId,
            templateHeadRecordSchema.parse(snapshot.data()).latestVersion,
        );
    }

    private remember(template: TemplateVersion): TemplateVersion {
        if (this.cache.size >= MAX_CACHED_VERSIONS) {
            const oldest = this.cache.keys().next().value;
            if (oldest !== undefined) this.cache.delete(oldest);
        }
        this.cache.set(cacheKey(template.templateId, template.version), template);
        return template;
    }
}

function cacheKey(templateId: string, version: number): string {
    return `${templateId}@${version}`;
}
