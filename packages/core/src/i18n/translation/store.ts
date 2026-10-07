import type { Messages } from './types';

export interface TranslationStoreState {
    locale: string;
    messages: Messages;
}

export interface TranslationStore {
    getState: () => TranslationStoreState;
    getNamespace: (namespace: string) => unknown;
    subscribe: (listener: () => void) => () => void;
    setState: (next: TranslationStoreState) => void;
}

export function createTranslationStore(initial: TranslationStoreState): TranslationStore {
    let state = initial;
    const listeners = new Set<() => void>();

    return {
        getState: () => state,
        getNamespace: (namespace) => (state.messages as Record<string, unknown>)[namespace],
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        setState: (next) => {
            if (next.locale === state.locale && next.messages === state.messages) {
                return;
            }
            state = next;
            listeners.forEach((listener) => listener());
        },
    };
}
