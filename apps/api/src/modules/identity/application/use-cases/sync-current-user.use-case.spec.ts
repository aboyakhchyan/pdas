import { principalOf } from '@testing/principal';
import { InMemoryUserRepository } from '../../testing/in-memory-user.repository';
import { SyncCurrentUser } from './sync-current-user.use-case';

describe('SyncCurrentUser', () => {
    let users: InMemoryUserRepository;
    let syncCurrentUser: SyncCurrentUser;

    beforeEach(() => {
        users = new InMemoryUserRepository();
        syncCurrentUser = new SyncCurrentUser(users);
    });

    it('registers a user on first sign-in', async () => {
        const user = await syncCurrentUser.execute(principalOf({ role: 'admin' }), 'ru');

        expect(user.toProps()).toMatchObject({
            id: 'user-1',
            role: 'admin',
            locale: 'ru',
            phoneNumber: '+37491123456',
            providers: ['phone'],
        });
        expect(users.users.has('user-1')).toBe(true);
    });

    it('does not write when the identity is unchanged', async () => {
        await syncCurrentUser.execute(principalOf(), 'hy');
        const save = jest.spyOn(users, 'save');

        await syncCurrentUser.execute(principalOf(), 'hy');

        expect(save).not.toHaveBeenCalled();
    });

    it('links a newly used sign-in provider', async () => {
        await syncCurrentUser.execute(principalOf(), 'hy');
        const google = principalOf({
            identity: {
                email: 'aram@example.com',
                phoneNumber: null,
                displayName: 'Aram',
                photoUrl: null,
                providers: ['google.com'],
            },
        });

        const user = await syncCurrentUser.execute(google, 'hy');

        expect(user.toProps()).toMatchObject({
            email: 'aram@example.com',
            phoneNumber: '+37491123456',
            displayName: 'Aram',
            providers: ['phone', 'google.com'],
        });
    });
});
