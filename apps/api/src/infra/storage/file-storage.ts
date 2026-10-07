import type {
    DownloadUrlRequest,
    SignedUpload,
    SignedUrl,
    StoredFile,
    UploadUrlRequest,
} from './interfaces/file-storage.interface';

export abstract class FileStorage {
    abstract createUploadUrl(request: UploadUrlRequest): Promise<SignedUpload>;
    abstract createDownloadUrl(request: DownloadUrlRequest): Promise<SignedUrl>;
    abstract save(file: StoredFile): Promise<void>;
    abstract exists(path: string): Promise<boolean>;
    abstract deleteByPrefix(prefix: string): Promise<void>;
}
