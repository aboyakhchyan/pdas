import type { AxiosInstance, RawAxiosRequestHeaders } from 'axios';

export interface TokenPair {
    accessToken: string;
    refreshToken?: string;
}

export interface TokenProvider {
    getAccessToken: () => string | null | undefined | Promise<string | null | undefined>;
    getRefreshToken?: () => string | null | undefined | Promise<string | null | undefined>;
    setTokens?: (tokens: TokenPair) => void | Promise<void>;
    clearTokens?: () => void | Promise<void>;
}

export interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    withCredentials?: boolean;
    headers?: RawAxiosRequestHeaders;
    tokenProvider?: TokenProvider;
    refreshToken?: (
        refreshToken: string | null | undefined,
        api: AxiosInstance,
    ) => Promise<TokenPair>;
    onUnauthorized?: (error: unknown) => void;
    getLocale?: () => string | null | undefined | Promise<string | null | undefined>;
}

declare module 'axios' {
    export interface AxiosRequestConfig {
        skipAuth?: boolean;
    }

    export interface InternalAxiosRequestConfig {
        _retry?: boolean;
    }
}
