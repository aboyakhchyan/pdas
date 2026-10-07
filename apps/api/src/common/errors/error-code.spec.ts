import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LOCALES } from '@pdas/core';
import { ERROR_CODES } from './error-code';

describe('error translations', () => {
    it.each(LOCALES)('translate every error code in %s', (locale) => {
        const path = join(__dirname, '..', '..', 'i18n', locale, 'errors.json');
        const messages = JSON.parse(readFileSync(path, 'utf8')) as Record<string, string>;

        expect(Object.keys(messages).sort()).toEqual([...ERROR_CODES].sort());
    });
});
