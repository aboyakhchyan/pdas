import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
    type AttachmentDto,
    type AttachmentUploadDto,
    type ContentValidationReportDto,
    type DocumentDto,
    type DocumentPageDto,
    MAX_ATTACHMENT_BYTES,
    type SignedDownloadDto,
    UPLOADABLE_ATTACHMENT_CONTENT_TYPES,
} from '@pdas/core';
import { Auth } from '@common/decorators/auth.decorator';
import { CurrentPrincipal } from '@common/decorators/current-principal.decorator';
import { FileUpload, IncomingUpload } from '@common/decorators/file-upload.decorator';
import type { Principal } from '@common/interfaces/principal.interface';
import type { IncomingFile, UploadRules } from '@common/interfaces/upload.interface';
import { ErrorResponse } from '@common/responses/error.response';
import { CreateDocument } from '../../application/use-cases/create-document.use-case';
import { DeleteDocument } from '../../application/use-cases/delete-document.use-case';
import { GetAttachmentDownload } from '../../application/use-cases/get-attachment-download.use-case';
import { GetDocument } from '../../application/use-cases/get-document.use-case';
import { GetDocumentPdf } from '../../application/use-cases/get-document-pdf.use-case';
import { ListAttachments } from '../../application/use-cases/list-attachments.use-case';
import { ListMyDocuments } from '../../application/use-cases/list-my-documents.use-case';
import { RequestAttachmentUpload } from '../../application/use-cases/request-attachment-upload.use-case';
import { UpdateDocumentContent } from '../../application/use-cases/update-document-content.use-case';
import { UploadAttachment } from '../../application/use-cases/upload-attachment.use-case';
import { ValidateDocument } from '../../application/use-cases/validate-document.use-case';
import {
    toAttachmentDto,
    toAttachmentUploadDto,
    toDocumentDto,
    toDocumentPageDto,
    toSignedDownloadDto,
} from '../presenters/document.presenter';
import { CreateDocumentRequest } from '../requests/create-document.request';
import { AttachmentParams, DocumentParams } from '../requests/document-params.request';
import { ListDocumentsRequest } from '../requests/list-documents.request';
import { RequestAttachmentUploadRequest } from '../requests/request-attachment-upload.request';
import { UpdateDocumentContentRequest } from '../requests/update-document-content.request';
import { AttachmentResponse, AttachmentUploadResponse } from '../responses/attachment.response';
import { ContentValidationReportResponse } from '../responses/content-validation-report.response';
import { DocumentPageResponse, DocumentResponse } from '../responses/document.response';
import { SignedDownloadResponse } from '../responses/signed-download.response';

const ATTACHMENT_UPLOAD: UploadRules = {
    field: 'file',
    maxBytes: MAX_ATTACHMENT_BYTES,
    contentTypes: UPLOADABLE_ATTACHMENT_CONTENT_TYPES,
    image: { maxWidth: 3000, maxHeight: 3000, quality: 85 },
};

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
    constructor(
        private readonly createDocument: CreateDocument,
        private readonly listMyDocuments: ListMyDocuments,
        private readonly getDocument: GetDocument,
        private readonly updateDocumentContent: UpdateDocumentContent,
        private readonly validateDocument: ValidateDocument,
        private readonly deleteDocument: DeleteDocument,
        private readonly getDocumentPdf: GetDocumentPdf,
        private readonly requestAttachmentUpload: RequestAttachmentUpload,
        private readonly uploadAttachment: UploadAttachment,
        private readonly listAttachments: ListAttachments,
        private readonly getAttachmentDownload: GetAttachmentDownload,
    ) {}

    @Post()
    @Auth('documents:create')
    @ApiOperation({ summary: 'Create a document from a template version' })
    @ApiCreatedResponse({ type: DocumentResponse })
    async create(
        @CurrentPrincipal() principal: Principal,
        @Body() input: CreateDocumentRequest,
    ): Promise<DocumentDto> {
        return toDocumentDto(await this.createDocument.execute(principal, input));
    }

    @Get()
    @Auth('documents:read')
    @ApiOperation({ summary: 'Own documents, most recently updated first' })
    @ApiOkResponse({ type: DocumentPageResponse })
    async list(
        @CurrentPrincipal() principal: Principal,
        @Query() query: ListDocumentsRequest,
    ): Promise<DocumentPageDto> {
        return toDocumentPageDto(await this.listMyDocuments.execute(principal, query));
    }

    @Get(':documentId')
    @Auth('documents:read')
    @ApiOperation({ summary: 'A document with its content' })
    @ApiOkResponse({ type: DocumentResponse })
    async get(
        @CurrentPrincipal() principal: Principal,
        @Param() { documentId }: DocumentParams,
    ): Promise<DocumentDto> {
        return toDocumentDto(await this.getDocument.execute(principal, documentId));
    }

    @Put(':documentId/content')
    @Auth('documents:update')
    @ApiOperation({ summary: 'Replace content; revision must match the stored one' })
    @ApiOkResponse({ type: DocumentResponse })
    async updateContent(
        @CurrentPrincipal() principal: Principal,
        @Param() { documentId }: DocumentParams,
        @Body() input: UpdateDocumentContentRequest,
    ): Promise<DocumentDto> {
        return toDocumentDto(
            await this.updateDocumentContent.execute(principal, documentId, input),
        );
    }

    @Get(':documentId/validation')
    @Auth('documents:read')
    @ApiOperation({ summary: 'What is still missing or invalid before the document is ready' })
    @ApiOkResponse({ type: ContentValidationReportResponse })
    validation(
        @CurrentPrincipal() principal: Principal,
        @Param() { documentId }: DocumentParams,
    ): Promise<ContentValidationReportDto> {
        return this.validateDocument.execute(principal, documentId);
    }

    @Get(':documentId/pdf')
    @Auth('documents:read')
    @ApiOperation({ summary: 'Short-lived signed URL to download the document as PDF' })
    @ApiOkResponse({ type: SignedDownloadResponse })
    @ApiUnprocessableEntityResponse({
        type: ErrorResponse,
        description: 'The content is not complete yet; `issues` lists what is missing',
    })
    async pdf(
        @CurrentPrincipal() principal: Principal,
        @Param() { documentId }: DocumentParams,
    ): Promise<SignedDownloadDto> {
        return toSignedDownloadDto(await this.getDocumentPdf.execute(principal, documentId));
    }

    @Delete(':documentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Auth('documents:delete')
    @ApiOperation({ summary: 'Delete a document with all its files' })
    @ApiNoContentResponse()
    async remove(
        @CurrentPrincipal() principal: Principal,
        @Param() { documentId }: DocumentParams,
    ): Promise<void> {
        await this.deleteDocument.execute(principal, documentId);
    }

    @Post(':documentId/attachments')
    @Auth('documents:update')
    @ApiOperation({ summary: 'Register an attachment and get a signed URL to upload it directly' })
    @ApiCreatedResponse({ type: AttachmentUploadResponse })
    async requestUpload(
        @CurrentPrincipal() principal: Principal,
        @Param() { documentId }: DocumentParams,
        @Body() input: RequestAttachmentUploadRequest,
    ): Promise<AttachmentUploadDto> {
        return toAttachmentUploadDto(
            await this.requestAttachmentUpload.execute(principal, documentId, input),
        );
    }

    @Post(':documentId/attachments/file')
    @Auth('documents:update')
    @FileUpload(ATTACHMENT_UPLOAD)
    @ApiOperation({
        summary: 'Upload an attachment through the API',
        description: 'Images are auto-rotated, stripped of metadata (EXIF, GPS) and downscaled.',
    })
    @ApiCreatedResponse({ type: AttachmentResponse })
    async upload(
        @CurrentPrincipal() principal: Principal,
        @Param() { documentId }: DocumentParams,
        @IncomingUpload(ATTACHMENT_UPLOAD) file: IncomingFile,
    ): Promise<AttachmentDto> {
        return toAttachmentDto(await this.uploadAttachment.execute(principal, documentId, file));
    }

    @Get(':documentId/attachments')
    @Auth('documents:read')
    @ApiOperation({ summary: 'Attachments of a document' })
    @ApiOkResponse({ type: [AttachmentResponse] })
    async attachments(
        @CurrentPrincipal() principal: Principal,
        @Param() { documentId }: DocumentParams,
    ): Promise<AttachmentDto[]> {
        return (await this.listAttachments.execute(principal, documentId)).map(toAttachmentDto);
    }

    @Get(':documentId/attachments/:attachmentId/download')
    @Auth('documents:read')
    @ApiOperation({ summary: 'Short-lived signed URL to download an attachment' })
    @ApiOkResponse({ type: SignedDownloadResponse })
    async download(
        @CurrentPrincipal() principal: Principal,
        @Param() { documentId, attachmentId }: AttachmentParams,
    ): Promise<SignedDownloadDto> {
        return toSignedDownloadDto(
            await this.getAttachmentDownload.execute(principal, documentId, attachmentId),
        );
    }
}
