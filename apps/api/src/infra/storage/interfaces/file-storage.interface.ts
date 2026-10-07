export interface SignedUrl {
    url: string;
    expiresAt: Date;
}

export interface SignedUpload extends SignedUrl {
    headers: Record<string, string>;
}

export interface UploadUrlRequest {
    path: string;
    contentType: string;
    maxBytes: number;
    expiresInSeconds: number;
}

export interface DownloadUrlRequest {
    path: string;
    fileName: string;
    expiresInSeconds: number;
}

export interface StoredFile {
    path: string;
    contentType: string;
    data: Buffer;
}
