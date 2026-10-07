import sharp from 'sharp';
import { UnsupportedMediaTypeError } from '@common/errors/domain-error';
import { SharpImageProcessor } from './sharp-image-processor';

async function photo(width: number, height: number): Promise<Buffer> {
    return sharp({ create: { width, height, channels: 3, background: '#808080' } })
        .withExif({ IFD0: { Make: 'Camera', Model: 'Phone' }, IFD3: { GPSLatitudeRef: 'N' } })
        .jpeg()
        .toBuffer();
}

describe('SharpImageProcessor', () => {
    const processor = new SharpImageProcessor();
    const rules = { maxWidth: 1000, maxHeight: 1000 };

    it('fits the image into the bounds and keeps its format', async () => {
        const image = await processor.normalize(await photo(3000, 1500), rules);

        expect(image).toMatchObject({
            format: 'jpeg',
            contentType: 'image/jpeg',
            width: 1000,
            height: 500,
        });
        expect(image.size).toBe(image.buffer.length);
    });

    it('strips EXIF and GPS metadata', async () => {
        const original = await photo(400, 400);
        expect((await sharp(original).metadata()).exif).toBeDefined();

        const image = await processor.normalize(original, rules);

        expect((await sharp(image.buffer).metadata()).exif).toBeUndefined();
    });

    it('never enlarges small images and converts when a format is requested', async () => {
        const image = await processor.normalize(await photo(200, 100), {
            ...rules,
            format: 'webp',
        });

        expect(image).toMatchObject({ format: 'webp', width: 200, height: 100 });
    });

    it('rejects content that is not an image', async () => {
        await expect(processor.normalize(Buffer.from('%PDF-1.7'), rules)).rejects.toBeInstanceOf(
            UnsupportedMediaTypeError,
        );
    });
});
