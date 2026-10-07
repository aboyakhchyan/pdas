import { Injectable } from '@nestjs/common';
import { ContentInvalidError } from '@common/errors/domain-error';
import type { Principal } from '@common/interfaces/principal.interface';
import { FileStorage } from '@infra/storage/file-storage';
import type { SignedUrl } from '@infra/storage/interfaces/file-storage.interface';
import { PdfRendering } from '@modules/rendering/application/services/pdf-rendering.service';
import { GetTemplateVersion } from '@modules/templates/application/use-cases/get-template-version.use-case';
import { ContentValidationService } from '@modules/validation/application/services/content-validation.service';
import type { Document } from '../../domain/entities/document.entity';
import { DocumentAccess } from '../services/document-access.service';
import { DocumentPrintout } from '../services/document-printout.service';

const DOWNLOAD_URL_TTL_SECONDS = 5 * 60;

/**
 * Renders a complete document to PDF once per revision, stores it next to the document and
 * returns a short-lived download link. Rendering is synchronous for now; move it behind a queue
 * when templates get heavy.
 */
@Injectable()
export class GetDocumentPdf {
    constructor(
        private readonly access: DocumentAccess,
        private readonly templates: GetTemplateVersion,
        private readonly validation: ContentValidationService,
        private readonly printout: DocumentPrintout,
        private readonly rendering: PdfRendering,
        private readonly storage: FileStorage,
    ) {}

    async execute(principal: Principal, documentId: string): Promise<SignedUrl> {
        const document = await this.access.readable(principal, documentId);
        if (!(await this.storage.exists(document.pdfPath))) await this.render(document);

        return this.storage.createDownloadUrl({
            path: document.pdfPath,
            fileName: `${document.title}.pdf`,
            expiresInSeconds: DOWNLOAD_URL_TTL_SECONDS,
        });
    }

    private async render(document: Document): Promise<void> {
        const template = await this.templates.execute(
            document.templateId,
            document.templateVersion,
        );
        const issues = this.validation.validate(template.blueprint, document.content, 'complete');
        if (issues.length > 0) throw new ContentInvalidError(issues);

        const pdf = await this.rendering.render(this.printout.compose(document, template));
        await this.storage.save({
            path: document.pdfPath,
            contentType: 'application/pdf',
            data: pdf,
        });
    }
}
