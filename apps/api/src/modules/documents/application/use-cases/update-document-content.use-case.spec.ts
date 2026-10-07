import { ConflictError, NotFoundError } from '@common/errors/domain-error';
import { documentsFixture, admin, owner } from '../../testing/documents-fixture';
import { UpdateDocumentContent } from './update-document-content.use-case';

describe('UpdateDocumentContent', () => {
    async function setup() {
        const fixture = await documentsFixture();
        const { access, documents, templates, validation } = fixture;
        return {
            ...fixture,
            update: new UpdateDocumentContent(access, documents, templates, validation),
        };
    }

    it('replaces content, bumps the revision and recomputes the status', async () => {
        const { update, draft, completePowerOfAttorney } = await setup();

        const document = await update.execute(owner, draft.id, {
            content: completePowerOfAttorney,
            revision: 1,
        });

        expect(document.toProps()).toMatchObject({ revision: 2, status: 'ready' });
    });

    it('rejects a stale revision', async () => {
        const { update, draft } = await setup();

        await expect(
            update.execute(owner, draft.id, { content: {}, revision: 2 }),
        ).rejects.toBeInstanceOf(ConflictError);
    });

    it('lets only the owner edit, even with read-any access', async () => {
        const { update, draft } = await setup();

        await expect(
            update.execute(admin, draft.id, { content: {}, revision: 1 }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
