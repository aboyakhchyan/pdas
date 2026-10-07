import { ConflictError, NotFoundError } from '@common/errors/domain-error';
import { documentsFixture, admin, owner } from '../../testing/documents-fixture';
import { RequestAttachmentUpload } from './request-attachment-upload.use-case';

describe('RequestAttachmentUpload', () => {
    const file = { fileName: 'passport.pdf', contentType: 'application/pdf' as const, size: 1024 };

    async function setup() {
        const fixture = await documentsFixture();
        const { access, documents, storage } = fixture;
        return {
            ...fixture,
            requestUpload: new RequestAttachmentUpload(access, documents, storage),
        };
    }

    it('registers the attachment under the document and returns a signed upload', async () => {
        const { requestUpload, documents, draft } = await setup();

        const { attachment, upload } = await requestUpload.execute(owner, draft.id, file);

        expect(attachment.storagePath).toBe(draft.attachmentPath(attachment.id));
        expect(upload.headers).toEqual({ 'Content-Type': 'application/pdf' });
        expect(documents.attachments).toEqual([attachment]);
    });

    it('caps the number of attachments per document', async () => {
        const { requestUpload, draft } = await setup();
        for (let i = 0; i < 20; i++) await requestUpload.execute(owner, draft.id, file);

        await expect(requestUpload.execute(owner, draft.id, file)).rejects.toBeInstanceOf(
            ConflictError,
        );
    });

    it('lets only the owner upload', async () => {
        const { requestUpload, draft } = await setup();

        await expect(requestUpload.execute(admin, draft.id, file)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });
});
