import type { UserDto } from '@pdas/core';
import type { User } from '../../domain/entities/user.entity';

export function toUserDto(user: User): UserDto {
    const { createdAt, updatedAt, ...props } = user.toProps();
    return { ...props, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() };
}
