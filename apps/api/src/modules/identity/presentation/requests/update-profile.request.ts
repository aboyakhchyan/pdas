import { type Locale, type UpdateProfileInput, updateProfileSchema } from '@pdas/core';
import { ContractField } from '@common/decorators/contract.decorator';

const { shape } = updateProfileSchema;

export class UpdateProfileRequest implements UpdateProfileInput {
    @ContractField(shape.displayName)
    displayName?: string;

    @ContractField(shape.locale)
    locale?: Locale;
}
