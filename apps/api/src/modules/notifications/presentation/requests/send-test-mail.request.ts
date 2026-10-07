import { type SendTestMailInput, sendTestMailSchema } from '@pdas/core';
import { ContractField } from '@common/decorators/contract.decorator';

export class SendTestMailRequest implements SendTestMailInput {
    @ContractField(sendTestMailSchema.shape.data)
    data: SendTestMailInput['data'];
}
