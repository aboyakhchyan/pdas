import { Injectable } from '@nestjs/common';
import {
    type AuthProvider,
    authProviderSchema,
    DEFAULT_ROLE,
    type Role,
    roleSchema,
} from '@pdas/core';
import { Auth, type DecodedIdToken } from 'firebase-admin/auth';
import { UnauthenticatedError } from '@common/errors/domain-error';
import type { Principal } from '@common/interfaces/principal.interface';
import { IdentityProvider } from '../domain/ports/identity-provider.port';

@Injectable()
export class FirebaseIdentityProvider extends IdentityProvider {
    constructor(private readonly auth: Auth) {
        super();
    }

    async verifyAccessToken(token: string): Promise<Principal> {
        const decoded = await this.auth.verifyIdToken(token).catch((error: unknown) => {
            if (isFirebaseAuthError(error)) throw new UnauthenticatedError();
            throw error;
        });

        if (!authProviderSchema.safeParse(decoded.firebase.sign_in_provider).success) {
            throw new UnauthenticatedError();
        }

        return {
            uid: decoded.uid,
            role: roleSchema.catch(DEFAULT_ROLE).parse(decoded['role']),
            identity: {
                email: decoded.email ?? null,
                phoneNumber: decoded.phone_number ?? null,
                displayName: stringClaim(decoded, 'name'),
                photoUrl: decoded.picture ?? null,
                providers: linkedProviders(decoded),
            },
        };
    }

    async assignRole(uid: string, role: Role): Promise<void> {
        await this.auth.setCustomUserClaims(uid, { role });
        await this.auth.revokeRefreshTokens(uid);
    }
}

function linkedProviders(decoded: DecodedIdToken): AuthProvider[] {
    return Object.keys(decoded.firebase.identities).filter(
        (provider): provider is AuthProvider => authProviderSchema.safeParse(provider).success,
    );
}

function stringClaim(decoded: DecodedIdToken, claim: string): string | null {
    const value: unknown = decoded[claim];
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function isFirebaseAuthError(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof error.code === 'string' &&
        error.code.startsWith('auth/')
    );
}
