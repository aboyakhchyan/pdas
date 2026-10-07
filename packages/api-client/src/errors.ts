import axios from 'axios';

export interface ApiErrorPayload {
    message: string;
    status?: number;
    code?: string;
    details?: unknown;
    isNetworkError?: boolean;
    isTimeout?: boolean;
}

export class ApiError extends Error {
    readonly status?: number;
    readonly code?: string;
    readonly details?: unknown;
    readonly isNetworkError: boolean;
    readonly isTimeout: boolean;

    constructor(payload: ApiErrorPayload, options?: ErrorOptions) {
        super(payload.message, options);
        this.name = 'ApiError';
        this.status = payload.status;
        this.code = payload.code;
        this.details = payload.details;
        this.isNetworkError = payload.isNetworkError ?? false;
        this.isTimeout = payload.isTimeout ?? false;
    }

    static fromUnknown(error: unknown, options?: ErrorOptions): ApiError {
        if (error instanceof ApiError) {
            return error;
        }

        if (!axios.isAxiosError(error)) {
            return new ApiError(
                { message: error instanceof Error ? error.message : 'Unknown error' },
                options,
            );
        }

        if (error.code === 'ECONNABORTED') {
            return new ApiError(
                { message: 'Request timed out', isTimeout: true, isNetworkError: true },
                options,
            );
        }

        if (!error.response) {
            return new ApiError(
                { message: error.message || 'Network error', isNetworkError: true },
                options,
            );
        }

        const data = error.response.data as
            { message?: string; code?: string; error?: string } | undefined;

        return new ApiError(
            {
                status: error.response.status,
                code: data?.code,
                message: data?.message ?? data?.error ?? error.message,
                details: data,
            },
            options,
        );
    }

    static isApiError(error: unknown): error is ApiError {
        return error instanceof ApiError;
    }
}
