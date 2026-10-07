import type { IdentifierFormat } from '@pdas/core';

const IDENTIFIER_PATTERNS: Readonly<Record<IdentifierFormat, RegExp>> = {
    'am-passport': /^[A-Z]{2}\d{7}$/,
    'am-id-card': /^\d{9}$/,
    'am-social-card': /^\d{10}$/,
    'am-tin': /^\d{8}$/,
    'am-postal-code': /^\d{4}$/,
    'am-vehicle-plate': /^\d{2}[A-Z]{2}\d{3}$/,
    'am-bank-account': /^\d{16}$/,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;
const MAX_EMAIL_LENGTH = 254;

const E164 = /^\+[1-9]\d{6,14}$/;
const NATIONAL_NUMBER_LENGTH: Readonly<Record<string, number>> = { '374': 8 };

export function isValidIdentifier(format: IdentifierFormat, value: string): boolean {
    return IDENTIFIER_PATTERNS[format].test(value);
}

export function isValidEmail(value: string): boolean {
    return value.length <= MAX_EMAIL_LENGTH && EMAIL.test(value);
}

export function isValidPhone(value: string, callingCodes?: string[]): boolean {
    if (!E164.test(value)) return false;

    const digits = value.slice(1);
    const matchesCountry = ([code, length]: [string, number]) =>
        !digits.startsWith(code) || digits.length === code.length + length;
    if (!Object.entries(NATIONAL_NUMBER_LENGTH).every(matchesCountry)) return false;

    return !callingCodes || callingCodes.some((code) => digits.startsWith(code));
}
