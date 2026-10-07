export type ImageFormat = 'jpeg' | 'png' | 'webp';

export interface ImageRules {
    maxWidth: number;
    maxHeight: number;
    /** Re-encode into this format; keeps the original format when omitted. */
    format?: ImageFormat;
    quality?: number;
}

export interface UploadRules {
    /** Multipart field that carries the file. */
    field: string;
    maxBytes: number;
    /** Accepted MIME types, detected from the file content (magic numbers), not the header. */
    contentTypes: readonly string[];
    /** When set, images are re-encoded: auto-rotated, metadata (EXIF, GPS) stripped, resized. */
    image?: ImageRules;
}

/** A validated uploaded file, independent of the HTTP library that received it. */
export interface IncomingFile {
    fileName: string;
    contentType: string;
    size: number;
    buffer: Buffer;
}
