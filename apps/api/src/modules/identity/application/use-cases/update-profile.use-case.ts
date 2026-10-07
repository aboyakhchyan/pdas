import { Injectable } from '@nestjs/common';
import type { UpdateProfileInput } from '@pdas/core';
import { NotFoundError } from '@common/errors/domain-error';
import type { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/ports/user.repository';

@Injectable()
export class UpdateProfile {
    constructor(private readonly users: UserRepository) {}

    async execute(userId: string, changes: UpdateProfileInput): Promise<User> {
        const user = await this.users.findById(userId);
        if (!user) throw new NotFoundError();

        user.updateProfile(changes, new Date());
        await this.users.save(user);
        return user;
    }
}
