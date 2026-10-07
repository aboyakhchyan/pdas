import { FileStorage } from '@infra/storage/file-storage';
import type {
    DownloadUrlRequest,
    SignedUpload,
    SignedUrl,
    StoredFile,
    UploadUrlRequest,
} from '@infra/storage/interfaces/file-storage.interface';

export class InMemoryFileStorage extends FileStorage {
    readonly paths = new Set<string>();
    readonly files = new Map<string, StoredFile>();

    async createUploadUrl({ path, contentType }: UploadUrlRequest): Promise<SignedUpload> {
        return {
            url: `https://storage.test/upload/${path}`,
            expiresAt: new Date(),
            headers: { 'Content-Type': contentType },
        };
    }

    async createDownloadUrl({ path }: DownloadUrlRequest): Promise<SignedUrl> {
        return { url: `https://storage.test/download/${path}`, expiresAt: new Date() };
    }

    async save(file: StoredFile): Promise<void> {
        this.paths.add(file.path);
        this.files.set(file.path, file);
    }

    async exists(path: string): Promise<boolean> {
        return this.paths.has(path);
    }

    async deleteByPrefix(prefix: string): Promise<void> {
        for (const path of this.paths) if (path.startsWith(prefix)) this.paths.delete(path);
    }
}
