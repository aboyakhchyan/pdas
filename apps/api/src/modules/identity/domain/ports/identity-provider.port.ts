import type { Role } from '@pdas/core';
import type { Principal } from '@common/interfaces/principal.interface';

export abstract class IdentityProvider {
    abstract verifyAccessToken(token: string): Promise<Principal>;
    abstract assignRole(uid: string, role: Role): Promise<void>;
}
