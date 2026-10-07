import type { AuthProvider, Role } from '@pdas/core';

export interface AuthIdentity {
    readonly email: string | null;
    readonly phoneNumber: string | null;
    readonly displayName: string | null;
    readonly photoUrl: string | null;
    readonly providers: AuthProvider[];
}

export interface Principal {
    readonly uid: string;
    readonly role: Role;
    readonly identity: AuthIdentity;
}

export interface PrincipalRequest {
    headers: { authorization?: string };
    principal?: Principal;
}
