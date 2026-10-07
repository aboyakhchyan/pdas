import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { ApiError } from './errors';
import type { ApiClientConfig, TokenPair } from './types';

export function createApiClient(config: ApiClientConfig): AxiosInstance {
    const instance = axios.create({
        baseURL: config.baseURL,
        timeout: config.timeout ?? 15_000,
        withCredentials: config.withCredentials ?? true,
        headers: config.headers,
    });

    let refreshPromise: Promise<TokenPair | null> | null = null;

    function refreshTokens(): Promise<TokenPair | null> {
        if (!refreshPromise) {
            refreshPromise = (async () => {
                try {
                    const refreshToken = (await config.tokenProvider?.getRefreshToken?.()) ?? null;
                    const tokens = await config.refreshToken?.(refreshToken, instance);
                    if (tokens) {
                        await config.tokenProvider?.setTokens?.(tokens);
                    }
                    return tokens ?? null;
                } finally {
                    refreshPromise = null;
                }
            })();
        }
        return refreshPromise;
    }

    instance.interceptors.request.use(async (requestConfig) => {
        if (!requestConfig.skipAuth && config.tokenProvider) {
            const token = await config.tokenProvider.getAccessToken();
            if (token) {
                requestConfig.headers.set('Authorization', `Bearer ${token}`);
            }
        }

        if (config.getLocale) {
            const locale = await config.getLocale();
            if (locale) {
                requestConfig.headers.set('X-Lang', locale);
            }
        }

        return requestConfig;
    });

    instance.interceptors.response.use(
        (response) => response,
        async (error: unknown) => {
            if (!axios.isAxiosError(error)) {
                return Promise.reject(ApiError.fromUnknown(error));
            }

            const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
            const status = error.response?.status;

            const shouldRefresh =
                status === 401 &&
                !!config.refreshToken &&
                !!originalRequest &&
                !originalRequest._retry &&
                !originalRequest.skipAuth;

            if (shouldRefresh && originalRequest) {
                originalRequest._retry = true;

                try {
                    const tokens = await refreshTokens();
                    if (!tokens?.accessToken) {
                        throw error;
                    }

                    originalRequest.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
                    return await instance(originalRequest);
                } catch (refreshError) {
                    await config.tokenProvider?.clearTokens?.();
                    config.onUnauthorized?.(error);
                    return Promise.reject(ApiError.fromUnknown(error, { cause: refreshError }));
                }
            }

            if (status === 401) {
                config.onUnauthorized?.(error);
            }

            return Promise.reject(ApiError.fromUnknown(error));
        },
    );

    return instance;
}
