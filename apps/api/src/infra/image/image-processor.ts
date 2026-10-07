import type { ImageRules } from '@common/interfaces/upload.interface';
import type { NormalizedImage } from './interfaces/normalized-image.interface';

export abstract class ImageProcessor {
    /**
     * Applies EXIF orientation, strips all metadata (EXIF, GPS, ICC comments), fits the image into
     * the bounds without enlarging it and re-encodes it. Throws `UnsupportedMediaTypeError` for
     * input that is not a decodable image.
     */
    abstract normalize(image: Buffer, rules: ImageRules): Promise<NormalizedImage>;
}
