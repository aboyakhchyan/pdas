import { NotFoundError } from '@common/errors/domain-error';
import { documentsFixture, admin, owner, stranger } from '../../testing/documents-fixture';
import { GetAttachmentDownload } from './get-attachment-download.use-case';
import { ListAttachments } from './list-attachments.use-case';
import { RequestAttachmentUpload } from './request-attachment-upload.use-case';

describe('attachment reads', () => {
    async function setup() {
        const fixture = await documentsFixture();
        const { access, documents, storage, draft } = fixture;
        const { attachment } = await new RequestAttachmentUpload(
            access,
            documents,
            storage,
        ).execute(owner, draft.id, {
            fileName: 'passport.pdf',
            contentType: 'application/pdf',
            size: 1024,
        });
        return {
            ...fixture,
            attachment,
            listAttachments: new ListAttachments(access, documents),
            getDownload: new GetAttachmentDownload(access, documents, storage),
        };
    }

    it('lists attachments for readers of the document', async () => {
        const { listAttachments, draft, attachment } = await setup();

        await expect(listAttachments.execute(admin, draft.id)).resolves.toEqual([attachment]);
        await expect(listAttachments.execute(stranger, draft.id)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    it('signs a download only once the file is actually uploaded', async () => {
        const { getDownload, storage, draft, attachment } = await setup();

        await expect(getDownload.execute(owner, draft.id, attachment.id)).rejects.toBeInstanceOf(
            NotFoundError,
        );

        storage.paths.add(attachment.storagePath);
        await expect(getDownload.execute(owner, draft.id, attachment.id)).resolves.toMatchObject({
            url: expect.stringContaining(attachment.storagePath),
        });
    });
});
