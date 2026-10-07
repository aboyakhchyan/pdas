import { type ListDocumentsQuery, listDocumentsQuerySchema } from '@pdas/core';
import { ContractField } from '@common/decorators/contract.decorator';

const { shape } = listDocumentsQuerySchema;

export class ListDocumentsRequest implements ListDocumentsQuery {
    @ContractField(shape.limit)
    limit: number;

    @ContractField(shape.cursor)
    cursor?: string;
}
