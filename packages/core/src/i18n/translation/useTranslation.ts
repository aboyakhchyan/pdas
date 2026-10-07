'use client';

import { isValidElement, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { formatDate, formatNumber, formatToString, getParsedMessage } from './format';
import { renderRichMessage, type RichComponents, type RichTranslationValues } from './rich';
import { useTranslationStore } from './provider';
import type { TranslationValues } from './types';

export interface TranslateFn {
    (key: string, values?: TranslationValues): string;
    (key: string, values: RichTranslationValues): ReactNode;
    rich: (key: string, components?: RichComponents, values?: RichTranslationValues) => ReactNode;
    has: (key: string) => boolean;
    raw: (key: string) => unknown;
    number: (value: number, style?: string) => string;
    date: (value: Date | number, style?: string) => string;
}

function getByPath(source: unknown, path: string[]): unknown {
    return path.reduce<unknown>((acc, segment) => {
        if (acc && typeof acc === 'object') {
            return (acc as Record<string, unknown>)[segment];
        }
        return undefined;
    }, source);
}

export function useTranslation(namespace: string): TranslateFn {
    const store = useTranslationStore();

    const getNamespaceSnapshot = () => store.getNamespace(namespace);
    const namespaceMessages = useSyncExternalStore(
        store.subscribe,
        getNamespaceSnapshot,
        getNamespaceSnapshot,
    );

    const getLocaleSnapshot = () => store.getState().locale;
    const locale = useSyncExternalStore(store.subscribe, getLocaleSnapshot, getLocaleSnapshot);

    return useMemo<TranslateFn>(() => {
        const resolve = (key: string): string | undefined => {
            const value = getByPath(namespaceMessages, key.split('.'));
            return typeof value === 'string' ? value : undefined;
        };

        const warnMissing = (key: string) => {
            if (process.env.NODE_ENV !== 'production') {
                console.warn(`[i18n] Missing translation for "${namespace}.${key}" (${locale})`);
            }
        };

        const translate = ((key: string, values?: RichTranslationValues): string | ReactNode => {
            const raw = resolve(key);
            if (raw === undefined) {
                warnMissing(key);
                return key;
            }

            const nodes = getParsedMessage(raw);

            const hasComponentValue =
                values !== undefined && Object.values(values).some(isValidElement);

            if (hasComponentValue) {
                return renderRichMessage(nodes, { values, locale });
            }

            return formatToString(nodes, {
                values: values as TranslationValues | undefined,
                locale,
            });
        }) as TranslateFn;

        translate.rich = (key, components, values) => {
            const raw = resolve(key);
            if (raw === undefined) {
                warnMissing(key);
                return key;
            }
            return renderRichMessage(getParsedMessage(raw), { values, locale, components });
        };

        translate.has = (key) => resolve(key) !== undefined;
        translate.raw = (key) => getByPath(namespaceMessages, key.split('.'));
        translate.number = (value, style) => formatNumber(value, style, locale);
        translate.date = (value, style) =>
            formatDate(value instanceof Date ? value : new Date(value), 'date', style, locale);

        return translate;
    }, [namespaceMessages, namespace, locale]);
}
