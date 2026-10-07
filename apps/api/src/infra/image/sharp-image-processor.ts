import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { UnsupportedMediaTypeError } from '@common/errors/domain-error';
import type { ImageFormat, ImageRules } from '@common/interfaces/upload.interface';
import { ImageProcessor } from './image-processor';
import type { NormalizedImage } from './interfaces/normalized-image.interface';

const DEFAULT_QUALITY = 82;
const MAX_INPUT_PIXELS = 50_000_000;
const SUPPORTED_FORMATS: readonly ImageFormat[] = ['jpeg', 'png', 'webp'];

@Injectable()
export class SharpImageProcessor extends ImageProcessor {
    async normalize(image: Buffer, rules: ImageRules): Promise<NormalizedImage> {
        const input = sharp(image, { failOn: 'error', limitInputPixels: MAX_INPUT_PIXELS });
        const format = rules.format ?? (await detectFormat(input));

        const { data, info } = await input
            .rotate()
            .resize({
                width: rules.maxWidth,
                height: rules.maxHeight,
                fit: 'inside',
                withoutEnlargement: true,
            })
            .toFormat(format, { quality: rules.quality ?? DEFAULT_QUALITY })
            .toBuffer({ resolveWithObject: true })
            .catch(() => {
                throw new UnsupportedMediaTypeError();
            });

        return {
            buffer: data,
            format,
            contentType: `image/${format}`,
            width: info.width,
            height: info.height,
            size: info.size,
        };
    }
}

async function detectFormat(input: sharp.Sharp): Promise<ImageFormat> {
    const { format } = await input.metadata().catch(() => {
        throw new UnsupportedMediaTypeError();
    });
    const supported = SUPPORTED_FORMATS.find((candidate) => candidate === format);
    if (!supported) throw new UnsupportedMediaTypeError();
    return supported;
}
