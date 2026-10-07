import { Injectable } from '@nestjs/common';
import type { Role } from '@pdas/core';
import { AccessDeniedError, NotFoundError } from '@common/errors/domain-error';
import type { Principal } from '@common/interfaces/principal.interface';
import type { User } from '../../domain/entities/user.entity';
import { IdentityProvider } from '../../domain/ports/identity-provider.port';
import { UserRepository } from '../../domain/ports/user.repository';

@Injectable()
export class AssignRole {
    constructor(
        private readonly users: UserRepository,
        private readonly identityProvider: IdentityProvider,
    ) {}

    async execute(actor: Principal, userId: string, role: Role): Promise<User> {
        if (actor.uid === userId) throw new AccessDeniedError();

        const user = await this.users.findById(userId);
        if (!user) throw new NotFoundError();

        await this.identityProvider.assignRole(userId, role);
        user.assignRole(role, new Date());
        await this.users.save(user);
        return user;
    }
}
