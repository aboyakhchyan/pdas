import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from '@pdas/core/i18n/routing';

const NAMESPACES = ['common', 'home'] as const;

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    const files = await Promise.all(
        NAMESPACES.map((namespace) => import(`../../messages/${locale}/${namespace}.json`)),
    );

    return {
        locale,
        messages: Object.assign({}, ...files.map((file) => file.default)),
    };
});
