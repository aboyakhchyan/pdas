import type { User } from '../domain/entities/user.entity';
import { UserRepository } from '../domain/ports/user.repository';

export class InMemoryUserRepository extends UserRepository {
    readonly users = new Map<string, User>();

    async findById(id: string): Promise<User | null> {
        return this.users.get(id) ?? null;
    }

    async save(user: User): Promise<void> {
        this.users.set(user.id, user);
    }
}
