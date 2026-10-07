import { CURRENCIES, type ValidationPath } from '@pdas/core';
import { parseIsoDate, resolveDateBound, toIsoDate } from './dates';
import { isValidEmail, isValidIdentifier, isValidPhone } from './formats';
import type {
    ContentRecord,
    FieldCheck,
    ScalarType,
    ScalarValidator,
} from './interfaces/content-validation.interface';
import { isRecord } from './values';

const patternCache = new Map<string, RegExp>();

function compiledPattern(pattern: string): RegExp {
    let compiled = patternCache.get(pattern);
    if (!compiled) {
        compiled = new RegExp(`^(?:${pattern})$`, 'u');
        patternCache.set(pattern, compiled);
    }
    return compiled;
}

function checkRange(
    value: number,
    bounds: { min?: number; max?: number },
    check: FieldCheck,
    at?: ValidationPath,
): void {
    if (bounds.min !== undefined && value < bounds.min)
        check.fail('tooSmall', { min: bounds.min }, at);
    if (bounds.max !== undefined && value > bounds.max)
        check.fail('tooBig', { max: bounds.max }, at);
}

function isMoney(value: unknown): value is ContentRecord & { amount: number; currency: string } {
    return (
        isRecord(value) &&
        Object.keys(value).every((key) => key === 'amount' || key === 'currency') &&
        Number.isSafeInteger(value['amount']) &&
        typeof value['currency'] === 'string'
    );
}

export const SCALAR_VALIDATORS: { readonly [T in ScalarType]: ScalarValidator<T> } = {
    text: (node, value, check) => {
        if (typeof value !== 'string') return check.fail('invalidType', { expected: 'text' });

        const length = [...value.trim()].length;
        if (node.minLength !== undefined && length < node.minLength) {
            check.fail('tooShort', { min: node.minLength });
        }
        if (node.maxLength !== undefined && length > node.maxLength) {
            check.fail('tooLong', { max: node.maxLength });
        }
        if (!node.multiline && /[\r\n]/.test(value))
            check.fail('invalidFormat', { format: 'singleLine' });
        if (node.pattern && !compiledPattern(node.pattern).test(value))
            check.fail('patternMismatch');
    },

    number: (node, value, check) => {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            return check.fail('invalidType', { expected: 'number' });
        }
        if (node.integer && !Number.isInteger(value)) check.fail('notInteger');
        checkRange(value, node, check);
    },

    money: (node, value, check) => {
        if (!isMoney(value)) return check.fail('invalidType', { expected: 'money' });

        const currencies: readonly string[] = node.currencies ?? CURRENCIES;
        if (!currencies.includes(value.currency)) {
            check.fail('invalidCurrency', { allowed: currencies.join(',') }, ['currency']);
        }
        checkRange(value.amount, node, check, ['amount']);
    },

    date: (node, value, check) => {
        const date = typeof value === 'string' ? parseIsoDate(value) : null;
        if (!date) return check.fail('invalidDate');

        const min = node.min && resolveDateBound(node.min, check.today);
        const max = node.max && resolveDateBound(node.max, check.today);
        if (min && date < min) check.fail('dateTooEarly', { min: toIsoDate(min) });
        if (max && date > max) check.fail('dateTooLate', { max: toIsoDate(max) });
    },

    boolean: (_node, value, check) => {
        if (typeof value !== 'boolean') check.fail('invalidType', { expected: 'boolean' });
    },

    choice: (node, value, check) => {
        const allowed = new Set(node.options.map((option) => option.value));

        if (!node.multiple) {
            if (typeof value !== 'string' || !allowed.has(value)) check.fail('invalidOption');
            return;
        }
        if (!Array.isArray(value)) return check.fail('invalidType', { expected: 'list' });

        const selected = new Set<string>();
        value.forEach((option: unknown, index) => {
            if (typeof option !== 'string' || !allowed.has(option)) {
                return check.fail('invalidOption', undefined, [index]);
            }
            if (selected.has(option)) check.fail('duplicateOption', undefined, [index]);
            selected.add(option);
        });
    },

    email: (_node, value, check) => {
        if (typeof value !== 'string' || !isValidEmail(value)) {
            check.fail('invalidFormat', { format: 'email' });
        }
    },

    phone: (node, value, check) => {
        if (typeof value !== 'string' || !isValidPhone(value, node.callingCodes)) {
            check.fail('invalidFormat', { format: 'phone' });
        }
    },

    identifier: (node, value, check) => {
        if (typeof value !== 'string' || !isValidIdentifier(node.format, value)) {
            check.fail('invalidFormat', { format: node.format });
        }
    },
};
