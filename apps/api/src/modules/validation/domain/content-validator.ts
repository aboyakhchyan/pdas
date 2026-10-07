import type {
    Blueprint,
    BlueprintNode,
    DocumentContent,
    FieldGroup,
    ListNode,
    ObjectRule,
    ScalarNode,
    ValidationCode,
    ValidationIssue,
    ValidationPath,
} from '@pdas/core';
import { evaluateCondition, fieldPathOf, resolveField } from './conditions';
import { parseIsoDate } from './dates';
import type {
    FieldScope,
    IssueParams,
    ScalarValidator,
    ValidationOptions,
    ValidationRun,
} from './interfaces/content-validation.interface';
import { SCALAR_VALIDATORS } from './scalar-validators';
import { isBlank, isRecord } from './values';

const MAX_ISSUES = 200;

export function validateContent(
    blueprint: Blueprint,
    content: DocumentContent,
    options: ValidationOptions,
): ValidationIssue[] {
    const run: ValidationRun = { ...options, root: content, issues: [] };
    validateGroup(blueprint, content, [], run);
    return run.issues;
}

function report(
    run: ValidationRun,
    path: ValidationPath,
    code: ValidationCode,
    params?: IssueParams,
) {
    if (run.issues.length >= MAX_ISSUES) return;
    run.issues.push(params ? { path, code, params } : { path, code });
}

function validateGroup(
    group: FieldGroup,
    value: unknown,
    path: ValidationPath,
    run: ValidationRun,
) {
    if (!isRecord(value)) return report(run, path, 'invalidType', { expected: 'object' });

    const knownKeys = new Set(group.fields.map((node) => node.key));
    for (const key of Object.keys(value)) {
        if (!knownKeys.has(key)) report(run, [...path, key], 'unknownField');
    }

    const scope: FieldScope = { local: value, root: run.root };
    for (const node of group.fields) validateField(node, scope, [...path, node.key], run);
    for (const rule of group.rules ?? []) applyRule(rule, scope, path, run);
}

function validateField(
    node: BlueprintNode,
    scope: FieldScope,
    path: ValidationPath,
    run: ValidationRun,
) {
    const value = scope.local[node.key];

    if (node.visibleWhen && !evaluateCondition(node.visibleWhen, scope)) {
        if (!isBlank(value)) report(run, path, 'notAllowed');
        return;
    }

    if (isBlank(value)) {
        if (run.mode === 'complete' && isRequired(node, scope)) report(run, path, 'required');
        return;
    }

    switch (node.type) {
        case 'object':
            return validateGroup(node, value, path, run);
        case 'list':
            return validateList(node, value, path, run);
        default:
            return validateScalar(node, value, path, run);
    }
}

function isRequired(node: BlueprintNode, scope: FieldScope): boolean {
    if (typeof node.required === 'object') return evaluateCondition(node.required, scope);
    return node.required === true;
}

function validateScalar(
    node: ScalarNode,
    value: unknown,
    path: ValidationPath,
    run: ValidationRun,
) {
    const validator = SCALAR_VALIDATORS[node.type] as ScalarValidator;
    validator(node, value, {
        today: run.today,
        fail: (code, params, at = []) => report(run, [...path, ...at], code, params),
    });
}

function validateList(node: ListNode, value: unknown, path: ValidationPath, run: ValidationRun) {
    if (!Array.isArray(value)) return report(run, path, 'invalidType', { expected: 'list' });

    if (node.maxItems !== undefined && value.length > node.maxItems) {
        report(run, path, 'tooManyItems', { max: node.maxItems });
    }
    if (run.mode === 'complete' && node.minItems !== undefined && value.length < node.minItems) {
        report(run, path, 'tooFewItems', { min: node.minItems });
    }

    value.forEach((item: unknown, index) => validateGroup(node.item, item, [...path, index], run));
    if (node.uniqueBy) reportDuplicates(value, node.uniqueBy, path, run);
}

function reportDuplicates(items: unknown[], key: string, path: ValidationPath, run: ValidationRun) {
    const seen = new Set<string>();
    items.forEach((item, index) => {
        if (!isRecord(item) || isBlank(item[key])) return;

        const fingerprint = JSON.stringify(item[key]);
        if (seen.has(fingerprint)) report(run, [...path, index, key], 'duplicateItem');
        seen.add(fingerprint);
    });
}

function applyRule(rule: ObjectRule, scope: FieldScope, path: ValidationPath, run: ValidationRun) {
    switch (rule.rule) {
        case 'dateOrder': {
            const earlier = asDate(resolveField(rule.earlier, scope));
            const later = asDate(resolveField(rule.later, scope));
            if (!earlier || !later) return;

            const violated = rule.allowEqual ? later < earlier : later <= earlier;
            if (violated)
                report(run, refPath(rule.later, path), 'dateOrder', { earlier: rule.earlier });
            return;
        }
        case 'atLeastOne': {
            const allBlank = rule.fields.every((ref) => isBlank(resolveField(ref, scope)));
            if (run.mode === 'complete' && allBlank) {
                report(run, path, 'atLeastOne', { fields: rule.fields.join(',') });
            }
            return;
        }
    }
}

function asDate(value: unknown): Date | null {
    return typeof value === 'string' ? parseIsoDate(value) : null;
}

function refPath(ref: string, path: ValidationPath): ValidationPath {
    const { fromRoot, segments } = fieldPathOf(ref);
    return fromRoot ? segments : [...path, ...segments];
}
