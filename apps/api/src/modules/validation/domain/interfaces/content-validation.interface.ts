import type { ScalarNode, ValidationCode, ValidationIssue, ValidationPath } from '@pdas/core';

export type ContentRecord = Record<string, unknown>;

export interface FieldScope {
    local: ContentRecord;
    root: ContentRecord;
}

export type ValidationMode = 'draft' | 'complete';

export interface ValidationOptions {
    mode: ValidationMode;
    today: Date;
}

export interface ValidationRun extends ValidationOptions {
    root: ContentRecord;
    issues: ValidationIssue[];
}

export type IssueParams = Record<string, string | number | boolean>;

export interface FieldCheck {
    readonly today: Date;
    fail(code: ValidationCode, params?: IssueParams, at?: ValidationPath): void;
}

export type ScalarType = ScalarNode['type'];

export type ScalarOf<T extends ScalarType> = Extract<ScalarNode, { type: T }>;

export type ScalarValidator<T extends ScalarType = ScalarType> = (
    node: ScalarOf<T>,
    value: unknown,
    check: FieldCheck,
) => void;
