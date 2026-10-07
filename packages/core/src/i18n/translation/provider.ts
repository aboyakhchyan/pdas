'use client';

import { createContext, createElement, useContext, useEffect, useRef, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { createTranslationStore, type TranslationStore } from './store';
import type { Messages } from './types';

const TranslationStoreContext = createContext<TranslationStore | null>(null);

export interface TranslationProviderProps {
    locale: string;
    messages: Messages;
    children: ReactNode;
}

export function TranslationProvider({ locale, messages, children }: TranslationProviderProps) {
    const storeRef = useRef<TranslationStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = createTranslationStore({ locale, messages });
    }

    useEffect(() => {
        storeRef.current?.setState({ locale, messages });
    }, [locale, messages]);

    return createElement(NextIntlClientProvider, {
        locale,
        messages,
        children: createElement(
            TranslationStoreContext.Provider,
            { value: storeRef.current },
            children,
        ),
    });
}

export function useTranslationStore(): TranslationStore {
    const store = useContext(TranslationStoreContext);
    if (!store) {
        throw new Error('useTranslation must be used within a <TranslationProvider>.');
    }
    return store;
}
