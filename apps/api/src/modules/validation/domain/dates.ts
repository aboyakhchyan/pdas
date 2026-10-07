import type { DateBound } from '@pdas/core';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseIsoDate(value: string): Date | null {
    const match = ISO_DATE.exec(value);
    if (!match) return null;

    const [year, month, day] = match.slice(1).map(Number) as [number, number, number];
    const date = new Date(Date.UTC(year, month - 1, day));
    const isRealDate =
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day;
    return isRealDate ? date : null;
}

export function toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export function resolveDateBound(bound: DateBound, today: Date): Date | null {
    if (typeof bound === 'string') return parseIsoDate(bound);

    return new Date(
        Date.UTC(
            today.getUTCFullYear() + (bound.years ?? 0),
            today.getUTCMonth() + (bound.months ?? 0),
            today.getUTCDate() + (bound.days ?? 0),
        ),
    );
}
