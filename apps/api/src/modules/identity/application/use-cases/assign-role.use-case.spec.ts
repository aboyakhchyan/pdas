import { AccessDeniedError, NotFoundError } from '@common/errors/domain-error';
import { principalOf } from '@testing/principal';
import { User } from '../../domain/entities/user.entity';
import type { IdentityProvider } from '../../domain/ports/identity-provider.port';
import { InMemoryUserRepository } from '../../testing/in-memory-user.repository';
import { AssignRole } from './assign-role.use-case';

describe('AssignRole', () => {
    const superAdmin = principalOf({ uid: 'super-admin-1', role: 'super-admin' });
    let users: InMemoryUserRepository;
    let identityProvider: jest.Mocked<IdentityProvider>;
    let assignRole: AssignRole;

    beforeEach(async () => {
        users = new InMemoryUserRepository();
        const { uid, role, identity } = principalOf();
        await users.save(User.register({ id: uid, role, locale: 'hy', identity }, new Date()));
        identityProvider = { verifyAccessToken: jest.fn(), assignRole: jest.fn() };
        assignRole = new AssignRole(users, identityProvider);
    });

    it('sets the role claim and stores it on the profile', async () => {
        const user = await assignRole.execute(superAdmin, 'user-1', 'admin');

        expect(identityProvider.assignRole).toHaveBeenCalledWith('user-1', 'admin');
        expect(user.toProps().role).toBe('admin');
    });

    it('forbids changing your own role', async () => {
        await expect(
            assignRole.execute(superAdmin, 'super-admin-1', 'user'),
        ).rejects.toBeInstanceOf(AccessDeniedError);
    });

    it('fails for an unknown user', async () => {
        await expect(assignRole.execute(superAdmin, 'missing', 'admin')).rejects.toBeInstanceOf(
            NotFoundError,
        );
        expect(identityProvider.assignRole).not.toHaveBeenCalled();
    });
});
