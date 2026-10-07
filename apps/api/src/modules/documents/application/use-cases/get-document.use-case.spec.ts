import { NotFoundError } from '@common/errors/domain-error';
import { documentsFixture, admin, owner, stranger } from '../../testing/documents-fixture';
import { GetDocument } from './get-document.use-case';

describe('GetDocument', () => {
    it('is readable by the owner and by roles with read-any access', async () => {
        const { access, draft } = await documentsFixture();
        const getDocument = new GetDocument(access);

        await expect(getDocument.execute(owner, draft.id)).resolves.toMatchObject({ id: draft.id });
        await expect(getDocument.execute(admin, draft.id)).resolves.toMatchObject({
            id: draft.id,
        });
    });

    it('hides the document from other users', async () => {
        const { access, draft } = await documentsFixture();

        await expect(new GetDocument(access).execute(stranger, draft.id)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });
});
