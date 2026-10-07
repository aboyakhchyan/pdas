import {
    ConflictError,
    NotFoundError,
    UnsupportedMediaTypeError,
} from '@common/errors/domain-error';
import type { IncomingFile } from '@common/interfaces/upload.interface';
import { documentsFixture, owner, stranger } from '../../testing/documents-fixture';
import { UploadAttachment } from './upload-attachment.use-case';

const scan: IncomingFile = {
    fileName: 'passport.jpg',
    contentType: 'image/jpeg',
    size: 4,
    buffer: Buffer.from('jpeg'),
};

describe('UploadAttachment', () => {
    async function setup() {
        const fixture = await documentsFixture();
        const { access, documents, storage } = fixture;
        return { ...fixture, upload: new UploadAttachment(access, documents, storage) };
    }

    it('stores the file under the document and registers the attachment', async () => {
        const { upload, storage, documents, draft } = await setup();

        const attachment = await upload.execute(owner, draft.id, scan);

        expect(attachment).toMatchObject({
            documentId: draft.id,
            fileName: 'passport.jpg',
            size: 4,
        });
        expect(storage.files.get(draft.attachmentPath(attachment.id))).toMatchObject({
            contentType: 'image/jpeg',
            data: scan.buffer,
        });
        await expect(documents.listAttachments(draft.id)).resolves.toEqual([attachment]);
    });

    it('accepts uploads only from the owner', async () => {
        const { upload, draft } = await setup();

        await expect(upload.execute(stranger, draft.id, scan)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    it('rejects types that are not valid attachments', async () => {
        const { upload, draft } = await setup();

        await expect(
            upload.execute(owner, draft.id, { ...scan, contentType: 'text/html' }),
        ).rejects.toBeInstanceOf(UnsupportedMediaTypeError);
    });

    it('limits the number of attachments per document', async () => {
        const { upload, draft } = await setup();
        for (let index = 0; index < 20; index++) await upload.execute(owner, draft.id, scan);

        await expect(upload.execute(owner, draft.id, scan)).rejects.toBeInstanceOf(ConflictError);
    });
});
