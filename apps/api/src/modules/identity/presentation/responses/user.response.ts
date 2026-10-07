import { type AuthProvider, type Locale, type Role, type UserDto, userSchema } from '@pdas/core';
import { ContractProperty } from '@common/decorators/contract.decorator';

const user = userSchema.shape;

export class UserResponse implements UserDto {
    @ContractProperty(user.id)
    id: string;

    @ContractProperty(user.email)
    email: string | null;

    @ContractProperty(user.phoneNumber)
    phoneNumber: string | null;

    @ContractProperty(user.displayName)
    displayName: string | null;

    @ContractProperty(user.photoUrl)
    photoUrl: string | null;

    @ContractProperty(user.role)
    role: Role;

    @ContractProperty(user.locale)
    locale: Locale;

    @ContractProperty(user.providers)
    providers: AuthProvider[];

    @ContractProperty(user.createdAt)
    createdAt: string;

    @ContractProperty(user.updatedAt)
    updatedAt: string;
}
