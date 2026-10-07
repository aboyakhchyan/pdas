import { Injectable } from '@nestjs/common';
import type { UpdateDocumentContentInput } from '@pdas/core';
import { ConflictError, ContentInvalidError } from '@common/errors/domain-error';
import type { Principal } from '@common/interfaces/principal.interface';
import { GetTemplateVersion } from '@modules/templates/application/use-cases/get-template-version.use-case';
import { ContentValidationService } from '@modules/validation/application/services/content-validation.service';
import { type Document, statusFor } from '../../domain/entities/document.entity';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { DocumentAccess } from '../services/document-access.service';

@Injectable()
export class UpdateDocumentContent {
    constructor(
        private readonly access: DocumentAccess,
        private readonly documents: DocumentRepository,
        private readonly templates: GetTemplateVersion,
        private readonly validation: ContentValidationService,
    ) {}

    async execute(
        principal: Principal,
        documentId: string,
        { content, revision }: UpdateDocumentContentInput,
    ): Promise<Document> {
        const document = await this.access.owned(principal, documentId);
        if (document.revision !== revision) throw new ConflictError();

        const template = await this.templates.execute(
            document.templateId,
            document.templateVersion,
        );
        const { issues, isComplete } = this.validation.assess(template.blueprint, content);
        if (issues.length > 0) throw new ContentInvalidError(issues);

        document.replaceContent(content, statusFor(isComplete), new Date());
        await this.documents.update(document, revision);
        return document;
    }
}
