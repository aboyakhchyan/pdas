import { type DocumentContent, type DocumentStatus, hasPermission, type Locale } from '@pdas/core';
import type { Principal } from '@common/interfaces/principal.interface';
import type { DocumentProps, NewDocument } from '../interfaces/document.interface';

export function statusFor(isComplete: boolean): DocumentStatus {
    return isComplete ? 'ready' : 'draft';
}

export class Document {
    private constructor(private props: DocumentProps) {}

    static create(document: NewDocument, now: Date): Document {
        return new Document({ ...document, revision: 1, createdAt: now, updatedAt: now });
    }

    static restore(props: DocumentProps): Document {
        return new Document({ ...props });
    }

    get id(): string {
        return this.props.id;
    }

    get title(): string {
        return this.props.title;
    }

    get locale(): Locale {
        return this.props.locale;
    }

    get templateId(): string {
        return this.props.templateId;
    }

    get templateVersion(): number {
        return this.props.templateVersion;
    }

    get content(): DocumentContent {
        return this.props.content;
    }

    get revision(): number {
        return this.props.revision;
    }

    get storagePrefix(): string {
        return `documents/${this.props.id}/`;
    }

    attachmentPath(attachmentId: string): string {
        return `${this.storagePrefix}attachments/${attachmentId}`;
    }

    /** One rendered PDF per content revision, so a cached file is never stale. */
    get pdfPath(): string {
        return `${this.storagePrefix}renders/revision-${this.props.revision}.pdf`;
    }

    isOwnedBy(principal: Principal): boolean {
        return principal.uid === this.props.ownerId;
    }

    isReadableBy(principal: Principal): boolean {
        return this.isOwnedBy(principal) || hasPermission(principal.role, 'documents:read:any');
    }

    replaceContent(content: DocumentContent, status: DocumentStatus, now: Date): void {
        this.props = {
            ...this.props,
            content,
            status,
            revision: this.props.revision + 1,
            updatedAt: now,
        };
    }

    toProps(): Readonly<DocumentProps> {
        return { ...this.props };
    }
}
