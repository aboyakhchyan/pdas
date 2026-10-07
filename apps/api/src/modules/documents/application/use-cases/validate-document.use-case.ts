import { Injectable } from '@nestjs/common';
import type { ContentValidationReportDto } from '@pdas/core';
import type { Principal } from '@common/interfaces/principal.interface';
import { GetTemplateVersion } from '@modules/templates/application/use-cases/get-template-version.use-case';
import { ContentValidationService } from '@modules/validation/application/services/content-validation.service';
import { DocumentAccess } from '../services/document-access.service';

@Injectable()
export class ValidateDocument {
    constructor(
        private readonly access: DocumentAccess,
        private readonly templates: GetTemplateVersion,
        private readonly validation: ContentValidationService,
    ) {}

    async execute(principal: Principal, documentId: string): Promise<ContentValidationReportDto> {
        const document = await this.access.readable(principal, documentId);
        const template = await this.templates.execute(
            document.templateId,
            document.templateVersion,
        );
        const issues = this.validation.validate(template.blueprint, document.content, 'complete');
        return { issues, isComplete: issues.length === 0 };
    }
}
