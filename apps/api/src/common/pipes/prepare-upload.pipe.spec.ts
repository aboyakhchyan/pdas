import { ImageProcessor } from '@infra/image/image-processor';
import type { NormalizedImage } from '@infra/image/interfaces/normalized-image.interface';
import type { UploadRules } from '../interfaces/upload.interface';
import { PrepareUploadPipe } from './prepare-upload.pipe';

class FakeImageProcessor extends ImageProcessor {
    async normalize(): Promise<NormalizedImage> {
        const buffer = Buffer.from('normalized');
        return {
            buffer,
            format: 'jpeg',
            contentType: 'image/jpeg',
            width: 10,
            height: 10,
            size: buffer.length,
        };
    }
}

function multerFile(originalname: string, mimetype: string): Express.Multer.File {
    const buffer = Buffer.from('original');
    return { originalname, mimetype, buffer, size: buffer.length } as Express.Multer.File;
}

describe('PrepareUploadPipe', () => {
    const rules: UploadRules = {
        field: 'file',
        maxBytes: 1024,
        contentTypes: ['application/pdf', 'image/png'],
        image: { maxWidth: 100, maxHeight: 100 },
    };
    const pipe = new (PrepareUploadPipe(rules))(new FakeImageProcessor());
    const prepare = (file: Express.Multer.File) => pipe.transform(file, { type: 'custom' });

    it('passes documents through with a sanitized file name', async () => {
        await expect(
            prepare(multerFile('../../etc/\u0007passport.pdf', 'application/pdf')),
        ).resolves.toEqual({
            fileName: 'passport.pdf',
            contentType: 'application/pdf',
            size: 8,
            buffer: Buffer.from('original'),
        });
    });

    it('normalizes images and renames them after the output format', async () => {
        await expect(prepare(multerFile('Անձնագիր.png', 'image/png'))).resolves.toMatchObject({
            fileName: 'Անձնագիր.jpg',
            contentType: 'image/jpeg',
            buffer: Buffer.from('normalized'),
        });
    });

    it('falls back to a neutral name when nothing safe is left', async () => {
        await expect(prepare(multerFile('\u0000', 'application/pdf'))).resolves.toMatchObject({
            fileName: 'file',
        });
    });
});
