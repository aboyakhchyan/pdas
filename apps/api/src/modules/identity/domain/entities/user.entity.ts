import type { Role } from '@pdas/core';
import type { AuthIdentity } from '@common/interfaces/principal.interface';
import type { ProfileChanges, UserProps, UserRegistration } from '../interfaces/user.interface';

export class User {
    private constructor(private props: UserProps) {}

    static register(registration: UserRegistration, now: Date): User {
        return new User({
            id: registration.id,
            role: registration.role,
            locale: registration.locale,
            ...registration.identity,
            providers: [...registration.identity.providers],
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: UserProps): User {
        return new User({ ...props });
    }

    get id(): string {
        return this.props.id;
    }

    syncIdentity(identity: AuthIdentity, now: Date): boolean {
        const providers = [...new Set([...this.props.providers, ...identity.providers])];
        const next = {
            email: identity.email ?? this.props.email,
            phoneNumber: identity.phoneNumber ?? this.props.phoneNumber,
            photoUrl: identity.photoUrl ?? this.props.photoUrl,
            displayName: this.props.displayName ?? identity.displayName,
        };
        const changed =
            providers.length !== this.props.providers.length ||
            (Object.keys(next) as (keyof typeof next)[]).some(
                (key) => next[key] !== this.props[key],
            );

        if (changed) this.props = { ...this.props, ...next, providers, updatedAt: now };
        return changed;
    }

    updateProfile(changes: ProfileChanges, now: Date): void {
        this.props = {
            ...this.props,
            displayName: changes.displayName ?? this.props.displayName,
            locale: changes.locale ?? this.props.locale,
            updatedAt: now,
        };
    }

    assignRole(role: Role, now: Date): void {
        this.props = { ...this.props, role, updatedAt: now };
    }

    toProps(): Readonly<UserProps> {
        return { ...this.props, providers: [...this.props.providers] };
    }
}
