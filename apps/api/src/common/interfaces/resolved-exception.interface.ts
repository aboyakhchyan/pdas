import type { ErrorCode } from '../errors/error-code';

export interface ResolvedException {
    status: number;
    code: ErrorCode;
    issues?: readonly unknown[];
    retryAfterSeconds?: number;
}
