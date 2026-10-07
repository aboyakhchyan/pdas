import { Module } from '@nestjs/common';
import { RenderingModule } from '@modules/rendering/rendering.module';
import { TemplatesModule } from '@modules/templates/templates.module';
import { ValidationModule } from '@modules/validation/validation.module';
import { DocumentAccess } from './application/services/document-access.service';
import { DocumentPrintout } from './application/services/document-printout.service';
import { CreateDocument } from './application/use-cases/create-document.use-case';
import { DeleteDocument } from './application/use-cases/delete-document.use-case';
import { GetAttachmentDownload } from './application/use-cases/get-attachment-download.use-case';
import { GetDocument } from './application/use-cases/get-document.use-case';
import { GetDocumentPdf } from './application/use-cases/get-document-pdf.use-case';
import { ListAttachments } from './application/use-cases/list-attachments.use-case';
import { ListMyDocuments } from './application/use-cases/list-my-documents.use-case';
import { RequestAttachmentUpload } from './application/use-cases/request-attachment-upload.use-case';
import { UpdateDocumentContent } from './application/use-cases/update-document-content.use-case';
import { UploadAttachment } from './application/use-cases/upload-attachment.use-case';
import { ValidateDocument } from './application/use-cases/validate-document.use-case';
import { DocumentRepository } from './domain/ports/document.repository';
import { FirestoreDocumentRepository } from './infrastructure/firestore-document.repository';
import { DocumentsController } from './presentation/controllers/documents.controller';

@Module({
    imports: [TemplatesModule, ValidationModule, RenderingModule],
    controllers: [DocumentsController],
    providers: [
        DocumentAccess,
        DocumentPrintout,
        CreateDocument,
        ListMyDocuments,
        GetDocument,
        UpdateDocumentContent,
        ValidateDocument,
        DeleteDocument,
        GetDocumentPdf,
        RequestAttachmentUpload,
        UploadAttachment,
        ListAttachments,
        GetAttachmentDownload,
        { provide: DocumentRepository, useClass: FirestoreDocumentRepository },
    ],
})
export class DocumentsModule {}
