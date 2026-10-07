import { createApiClient } from '@pdas/api-client';

export const api = createApiClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL!,
    withCredentials: true,
    refreshToken: async (_refreshToken, api) => {
        await api.post('/auth/refresh', {}, { skipAuth: true });
        return { accessToken: 'refreshed' };
    },
    onUnauthorized: () => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- hard redirect is intentional: this runs inside an axios interceptor with no router/render context, and a full reload clears all client state after an auth failure
            window.location.href = '/login';
        }
    },
    getLocale: () => {
        if (typeof document === 'undefined') return null;
        return document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/)?.[1] ?? null;
    },
});
