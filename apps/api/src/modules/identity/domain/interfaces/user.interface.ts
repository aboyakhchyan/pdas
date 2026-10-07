import type { AuthProvider, Locale, Role } from '@pdas/core';
import type { AuthIdentity } from '@common/interfaces/principal.interface';

export interface UserProps {
    id: string;
    email: string | null;
    phoneNumber: string | null;
    displayName: string | null;
    photoUrl: string | null;
    role: Role;
    locale: Locale;
    providers: AuthProvider[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ProfileChanges {
    displayName?: string;
    locale?: Locale;
}

export interface UserRegistration {
    id: string;
    role: Role;
    locale: Locale;
    identity: AuthIdentity;
}
