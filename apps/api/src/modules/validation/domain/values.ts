import type { ContentRecord } from './interfaces/content-validation.interface';

export function isRecord(value: unknown): value is ContentRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isBlank(value: unknown): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    return false;
}
