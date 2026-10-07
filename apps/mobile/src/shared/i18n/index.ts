import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, LOCALES } from '@pdas/core';
import hyHome from './messages/hy/home.json';
import enHome from './messages/en/home.json';
import ruHome from './messages/ru/home.json';

export const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: LOCALES,
    resources: {
        hy: { home: hyHome },
        en: { home: enHome },
        ru: { home: ruHome },
    },
    interpolation: { escapeValue: false },
});
