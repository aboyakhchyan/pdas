import { ContentInvalidError, NotFoundError } from '@common/errors/domain-error';
import { documentsFixture, owner } from '../../testing/documents-fixture';
import { CreateDocument } from './create-document.use-case';

describe('CreateDocument', () => {
    const input = { templateId: 'power-of-attorney', title: 'Լիազորագիր', locale: 'hy' as const };

    it('creates an incomplete document as a draft pinned to the latest template version', async () => {
        const { draft } = await documentsFixture();

        expect(draft.toProps()).toMatchObject({
            ownerId: 'owner-1',
            templateVersion: 1,
            status: 'draft',
            revision: 1,
        });
    });

    it('marks complete content as ready', async () => {
        const { documents, templates, validation, completePowerOfAttorney } =
            await documentsFixture();

        const document = await new CreateDocument(documents, templates, validation).execute(owner, {
            ...input,
            content: completePowerOfAttorney,
        });

        expect(document.toProps().status).toBe('ready');
    });

    it('rejects content that breaks the blueprint', async () => {
        const { documents, templates, validation } = await documentsFixture();
        const create = new CreateDocument(documents, templates, validation);

        await expect(
            create.execute(owner, { ...input, content: { principal: { passport: 'invalid' } } }),
        ).rejects.toBeInstanceOf(ContentInvalidError);
    });

    it('fails for an unknown template', async () => {
        const { documents, templates, validation } = await documentsFixture();
        const create = new CreateDocument(documents, templates, validation);

        await expect(
            create.execute(owner, { ...input, templateId: 'unknown', content: {} }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
