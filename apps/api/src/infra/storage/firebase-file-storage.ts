import { Injectable } from '@nestjs/common';
import { Storage } from 'firebase-admin/storage';
import { FileStorage } from './file-storage';
import type {
    DownloadUrlRequest,
    SignedUpload,
    SignedUrl,
    StoredFile,
    UploadUrlRequest,
} from './interfaces/file-storage.interface';

type Bucket = ReturnType<Storage['bucket']>;

@Injectable()
export class FirebaseFileStorage extends FileStorage {
    private readonly bucket: Bucket;

    constructor(storage: Storage) {
        super();
        this.bucket = storage.bucket();
    }

    async createUploadUrl({
        path,
        contentType,
        maxBytes,
        expiresInSeconds,
    }: UploadUrlRequest): Promise<SignedUpload> {
        const expiresAt = expiryFrom(expiresInSeconds);
        const extensionHeaders = { 'x-goog-content-length-range': `0,${maxBytes}` };
        const [url] = await this.bucket.file(path).getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: expiresAt,
            contentType,
            extensionHeaders,
        });
        return { url, expiresAt, headers: { 'Content-Type': contentType, ...extensionHeaders } };
    }

    async createDownloadUrl({
        path,
        fileName,
        expiresInSeconds,
    }: DownloadUrlRequest): Promise<SignedUrl> {
        const expiresAt = expiryFrom(expiresInSeconds);
        const [url] = await this.bucket.file(path).getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: expiresAt,
            responseDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        });
        return { url, expiresAt };
    }

    async save({ path, contentType, data }: StoredFile): Promise<void> {
        await this.bucket.file(path).save(data, { contentType, resumable: false });
    }

    async exists(path: string): Promise<boolean> {
        const [exists] = await this.bucket.file(path).exists();
        return exists;
    }

    async deleteByPrefix(prefix: string): Promise<void> {
        await this.bucket.deleteFiles({ prefix, force: true });
    }
}

function expiryFrom(seconds: number): Date {
    return new Date(Date.now() + seconds * 1000);
}
