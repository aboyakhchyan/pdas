import { NotFoundError } from '@common/errors/domain-error';
import { InMemoryTemplateRepository } from '../../testing/in-memory-template.repository';
import { powerOfAttorneyBlueprint } from '../../testing/power-of-attorney.blueprint';
import { GetTemplateVersion } from './get-template-version.use-case';

describe('GetTemplateVersion', () => {
    let getTemplateVersion: GetTemplateVersion;

    beforeEach(async () => {
        const templates = new InMemoryTemplateRepository();
        const draft = {
            templateId: 'power-of-attorney',
            title: { hy: 'Լիազորագիր', en: 'Power of attorney', ru: 'Доверенность' },
            blueprint: powerOfAttorneyBlueprint,
            publishedBy: 'admin-1',
        };
        await templates.publish(draft, new Date());
        await templates.publish(draft, new Date());
        getTemplateVersion = new GetTemplateVersion(templates);
    });

    it('returns the latest version by default', async () => {
        expect((await getTemplateVersion.execute('power-of-attorney')).version).toBe(2);
    });

    it('returns a specific version', async () => {
        expect((await getTemplateVersion.execute('power-of-attorney', 1)).version).toBe(1);
    });

    it('fails for an unknown template or version', async () => {
        await expect(getTemplateVersion.execute('unknown')).rejects.toBeInstanceOf(NotFoundError);
        await expect(getTemplateVersion.execute('power-of-attorney', 3)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });
});
