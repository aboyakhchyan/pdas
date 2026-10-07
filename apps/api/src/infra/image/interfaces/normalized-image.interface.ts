import type { ImageFormat } from '@common/interfaces/upload.interface';

export interface NormalizedImage {
    buffer: Buffer;
    format: ImageFormat;
    contentType: string;
    width: number;
    height: number;
    size: number;
}
