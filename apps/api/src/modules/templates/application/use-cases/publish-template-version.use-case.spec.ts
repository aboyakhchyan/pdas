import { principalOf } from '@testing/principal';
import { InMemoryTemplateRepository } from '../../testing/in-memory-template.repository';
import { powerOfAttorneyBlueprint } from '../../testing/power-of-attorney.blueprint';
import { PublishTemplateVersion } from './publish-template-version.use-case';

describe('PublishTemplateVersion', () => {
    it('publishes incrementing immutable versions attributed to the publisher', async () => {
        const publish = new PublishTemplateVersion(new InMemoryTemplateRepository());
        const admin = principalOf({ uid: 'admin-1', role: 'admin' });
        const input = {
            title: { hy: 'Լիազորագիր', en: 'Power of attorney', ru: 'Доверенность' },
            blueprint: powerOfAttorneyBlueprint,
        };

        const first = await publish.execute(admin, 'power-of-attorney', input);
        const second = await publish.execute(admin, 'power-of-attorney', input);

        expect(first).toMatchObject({ version: 1, publishedBy: 'admin-1' });
        expect(second.version).toBe(2);
    });
});
