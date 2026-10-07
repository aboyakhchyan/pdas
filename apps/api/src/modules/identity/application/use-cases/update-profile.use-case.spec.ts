import { NotFoundError } from '@common/errors/domain-error';
import { principalOf } from '@testing/principal';
import { User } from '../../domain/entities/user.entity';
import { InMemoryUserRepository } from '../../testing/in-memory-user.repository';
import { UpdateProfile } from './update-profile.use-case';

describe('UpdateProfile', () => {
    it('updates the display name and locale', async () => {
        const users = new InMemoryUserRepository();
        const { uid, role, identity } = principalOf();
        await users.save(User.register({ id: uid, role, locale: 'hy', identity }, new Date()));

        const user = await new UpdateProfile(users).execute(uid, {
            displayName: 'Aram',
            locale: 'en',
        });

        expect(user.toProps()).toMatchObject({ displayName: 'Aram', locale: 'en' });
    });

    it('fails for an unknown user', async () => {
        await expect(
            new UpdateProfile(new InMemoryUserRepository()).execute('missing', { locale: 'en' }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
