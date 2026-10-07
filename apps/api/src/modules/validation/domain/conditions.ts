import type { Condition, ScalarValue } from '@pdas/core';
import type { FieldScope } from './interfaces/content-validation.interface';
import { isBlank, isRecord } from './values';

const ROOT_PREFIX = '$.';

export function fieldPathOf(ref: string): { fromRoot: boolean; segments: string[] } {
    const fromRoot = ref.startsWith(ROOT_PREFIX);
    return { fromRoot, segments: (fromRoot ? ref.slice(ROOT_PREFIX.length) : ref).split('.') };
}

export function resolveField(ref: string, scope: FieldScope): unknown {
    const { fromRoot, segments } = fieldPathOf(ref);
    return segments.reduce<unknown>(
        (value, segment) => (isRecord(value) ? value[segment] : undefined),
        fromRoot ? scope.root : scope.local,
    );
}

function matches(value: unknown, expected: ScalarValue): boolean {
    return Array.isArray(value) ? value.includes(expected) : value === expected;
}

export function evaluateCondition(condition: Condition, scope: FieldScope): boolean {
    switch (condition.op) {
        case 'equals':
            return matches(resolveField(condition.field, scope), condition.value);
        case 'notEquals':
            return !matches(resolveField(condition.field, scope), condition.value);
        case 'in': {
            const value = resolveField(condition.field, scope);
            return condition.values.some((expected) => matches(value, expected));
        }
        case 'filled':
            return !isBlank(resolveField(condition.field, scope));
        case 'empty':
            return isBlank(resolveField(condition.field, scope));
        case 'all':
            return condition.conditions.every((nested) => evaluateCondition(nested, scope));
        case 'any':
            return condition.conditions.some((nested) => evaluateCondition(nested, scope));
        case 'not':
            return !evaluateCondition(condition.condition, scope);
    }
}
