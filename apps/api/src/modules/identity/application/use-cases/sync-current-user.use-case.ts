import { Injectable } from '@nestjs/common';
import type { Locale } from '@pdas/core';
import type { Principal } from '@common/interfaces/principal.interface';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/ports/user.repository';

@Injectable()
export class SyncCurrentUser {
    constructor(private readonly users: UserRepository) {}

    async execute(principal: Principal, locale: Locale): Promise<User> {
        const now = new Date();
        const existing = await this.users.findById(principal.uid);

        if (!existing) {
            const user = User.register(
                { id: principal.uid, role: principal.role, locale, identity: principal.identity },
                now,
            );
            await this.users.save(user);
            return user;
        }

        if (existing.syncIdentity(principal.identity, now)) await this.users.save(existing);
        return existing;
    }
}
