import { NotFoundError } from '@common/errors/domain-error';
import { documentsFixture, owner, stranger } from '../../testing/documents-fixture';
import { DeleteDocument } from './delete-document.use-case';

describe('DeleteDocument', () => {
    it('removes the document and every stored file under it', async () => {
        const { access, documents, storage, draft } = await documentsFixture();
        storage.paths.add(draft.attachmentPath('file-1'));
        storage.paths.add('documents/other/attachments/file-2');

        await new DeleteDocument(access, documents, storage).execute(owner, draft.id);

        expect(documents.documents.has(draft.id)).toBe(false);
        expect([...storage.paths]).toEqual(['documents/other/attachments/file-2']);
    });

    it('lets only the owner delete', async () => {
        const { access, documents, storage, draft } = await documentsFixture();

        await expect(
            new DeleteDocument(access, documents, storage).execute(stranger, draft.id),
        ).rejects.toBeInstanceOf(NotFoundError);
        expect(documents.documents.has(draft.id)).toBe(true);
    });
});
