import { ApiProperty } from '@nestjs/swagger';
import {
    type DocumentContent,
    type DocumentDto,
    type DocumentPageDto,
    documentPageSchema,
    documentSchema,
    type DocumentStatus,
    type DocumentSummaryDto,
    documentSummarySchema,
    type Locale,
} from '@pdas/core';
import { ContractProperty } from '@common/decorators/contract.decorator';

const summary = documentSummarySchema.shape;

export class DocumentSummaryResponse implements DocumentSummaryDto {
    @ContractProperty(summary.id)
    id: string;

    @ContractProperty(summary.ownerId)
    ownerId: string;

    @ContractProperty(summary.templateId)
    templateId: string;

    @ContractProperty(summary.templateVersion)
    templateVersion: number;

    @ContractProperty(summary.title)
    title: string;

    @ContractProperty(summary.locale)
    locale: Locale;

    @ContractProperty(summary.status)
    status: DocumentStatus;

    @ContractProperty(summary.revision)
    revision: number;

    @ContractProperty(summary.createdAt)
    createdAt: string;

    @ContractProperty(summary.updatedAt)
    updatedAt: string;
}

export class DocumentResponse extends DocumentSummaryResponse implements DocumentDto {
    @ContractProperty(documentSchema.shape.content)
    content: DocumentContent;
}

export class DocumentPageResponse implements DocumentPageDto {
    @ApiProperty({ type: [DocumentSummaryResponse] })
    items: DocumentSummaryResponse[];

    @ContractProperty(documentPageSchema.shape.nextCursor)
    nextCursor: string | null;
}
