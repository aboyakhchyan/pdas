import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { CreateDocumentInput } from '@pdas/core';
import { ContentInvalidError } from '@common/errors/domain-error';
import type { Principal } from '@common/interfaces/principal.interface';
import { GetTemplateVersion } from '@modules/templates/application/use-cases/get-template-version.use-case';
import { ContentValidationService } from '@modules/validation/application/services/content-validation.service';
import { Document, statusFor } from '../../domain/entities/document.entity';
import { DocumentRepository } from '../../domain/ports/document.repository';

@Injectable()
export class CreateDocument {
    constructor(
        private readonly documents: DocumentRepository,
        private readonly templates: GetTemplateVersion,
        private readonly validation: ContentValidationService,
    ) {}

    async execute(principal: Principal, input: CreateDocumentInput): Promise<Document> {
        const template = await this.templates.execute(input.templateId, input.templateVersion);
        const { issues, isComplete } = this.validation.assess(template.blueprint, input.content);
        if (issues.length > 0) throw new ContentInvalidError(issues);

        const document = Document.create(
            {
                id: randomUUID(),
                ownerId: principal.uid,
                templateId: template.templateId,
                templateVersion: template.version,
                title: input.title,
                locale: input.locale,
                content: input.content,
                status: statusFor(isComplete),
            },
            new Date(),
        );
        await this.documents.create(document);
        return document;
    }
}
