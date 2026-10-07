import { type SignedDownloadDto, signedDownloadSchema } from '@pdas/core';
import { ContractProperty } from '@common/decorators/contract.decorator';

export class SignedDownloadResponse implements SignedDownloadDto {
    @ContractProperty(signedDownloadSchema.shape.url)
    url: string;

    @ContractProperty(signedDownloadSchema.shape.expiresAt)
    expiresAt: string;
}
