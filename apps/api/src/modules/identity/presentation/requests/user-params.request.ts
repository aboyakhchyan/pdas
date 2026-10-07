import { userIdSchema } from '@pdas/core';
import { ContractField } from '@common/decorators/contract.decorator';

export class UserParams {
    @ContractField(userIdSchema)
    userId: string;
}
