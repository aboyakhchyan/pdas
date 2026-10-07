import { z } from 'zod';
import { localizedTextSchema } from '../constants/locale';
import { currencySchema } from '../constants/money';

const MAX_BLUEPRINT_DEPTH = 8;

const fieldKeySchema = z
    .string()
    .max(64)
    .regex(/^[a-z][a-zA-Z0-9]*$/);

export const fieldRefSchema = z
    .string()
    .max(256)
    .regex(/^(\$\.)?[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*$/);

export const scalarValueSchema = z.union([z.string(), z.number(), z.boolean()]);
export type ScalarValue = z.infer<typeof scalarValueSchema>;

export type Condition =
    | { op: 'equals'; field: string; value: ScalarValue }
    | { op: 'notEquals'; field: string; value: ScalarValue }
    | { op: 'in'; field: string; values: ScalarValue[] }
    | { op: 'filled'; field: string }
    | { op: 'empty'; field: string }
    | { op: 'all'; conditions: Condition[] }
    | { op: 'any'; conditions: Condition[] }
    | { op: 'not'; condition: Condition };

export const conditionSchema: z.ZodType<Condition> = z.lazy(() =>
    z.discriminatedUnion('op', [
        z.object({ op: z.literal('equals'), field: fieldRefSchema, value: scalarValueSchema }),
        z.object({ op: z.literal('notEquals'), field: fieldRefSchema, value: scalarValueSchema }),
        z.object({
            op: z.literal('in'),
            field: fieldRefSchema,
            values: z.array(scalarValueSchema).min(1),
        }),
        z.object({ op: z.literal('filled'), field: fieldRefSchema }),
        z.object({ op: z.literal('empty'), field: fieldRefSchema }),
        z.object({ op: z.literal('all'), conditions: z.array(conditionSchema).min(1) }),
        z.object({ op: z.literal('any'), conditions: z.array(conditionSchema).min(1) }),
        z.object({ op: z.literal('not'), condition: conditionSchema }),
    ]),
);

export const isoDateSchema = z.iso.date();

export const dateBoundSchema = z.union([
    isoDateSchema,
    z.object({
        relativeTo: z.literal('today'),
        years: z.int().optional(),
        months: z.int().optional(),
        days: z.int().optional(),
    }),
]);
export type DateBound = z.infer<typeof dateBoundSchema>;

export const IDENTIFIER_FORMATS = [
    'am-passport',
    'am-id-card',
    'am-social-card',
    'am-tin',
    'am-postal-code',
    'am-vehicle-plate',
    'am-bank-account',
] as const;
export const identifierFormatSchema = z.enum(IDENTIFIER_FORMATS);
export type IdentifierFormat = z.infer<typeof identifierFormatSchema>;

const nodeBaseSchema = z.object({
    key: fieldKeySchema,
    label: localizedTextSchema,
    hint: localizedTextSchema.optional(),
    required: z.union([z.boolean(), conditionSchema]).optional(),
    visibleWhen: conditionSchema.optional(),
});
type NodeBase = z.infer<typeof nodeBaseSchema>;

const compilablePatternSchema = z
    .string()
    .max(500)
    .refine(
        (pattern) => {
            try {
                new RegExp(pattern, 'u');
                return true;
            } catch {
                return false;
            }
        },
        { message: 'Invalid regular expression' },
    );

const choiceOptionSchema = z.object({ value: fieldKeySchema, label: localizedTextSchema });

const scalarNodeSchemas = [
    nodeBaseSchema.extend({
        type: z.literal('text'),
        minLength: z.int().min(0).optional(),
        maxLength: z.int().min(1).max(10_000).optional(),
        pattern: compilablePatternSchema.optional(),
        multiline: z.boolean().optional(),
    }),
    nodeBaseSchema.extend({
        type: z.literal('number'),
        min: z.number().optional(),
        max: z.number().optional(),
        integer: z.boolean().optional(),
    }),
    nodeBaseSchema.extend({
        type: z.literal('money'),
        currencies: z.array(currencySchema).min(1).optional(),
        min: z.int().optional(),
        max: z.int().optional(),
    }),
    nodeBaseSchema.extend({
        type: z.literal('date'),
        min: dateBoundSchema.optional(),
        max: dateBoundSchema.optional(),
    }),
    nodeBaseSchema.extend({ type: z.literal('boolean') }),
    nodeBaseSchema.extend({
        type: z.literal('choice'),
        options: z
            .array(choiceOptionSchema)
            .min(1)
            .max(200)
            .refine((options) => new Set(options.map((o) => o.value)).size === options.length, {
                message: 'Option values must be unique',
            }),
        multiple: z.boolean().optional(),
    }),
    nodeBaseSchema.extend({ type: z.literal('email') }),
    nodeBaseSchema.extend({
        type: z.literal('phone'),
        callingCodes: z
            .array(z.string().regex(/^[1-9]\d{0,2}$/))
            .min(1)
            .optional(),
    }),
    nodeBaseSchema.extend({ type: z.literal('identifier'), format: identifierFormatSchema }),
] as const;

const scalarNodeSchema = z.discriminatedUnion('type', scalarNodeSchemas);
export type ScalarNode = z.infer<typeof scalarNodeSchema>;

export const objectRuleSchema = z.discriminatedUnion('rule', [
    z.object({
        rule: z.literal('dateOrder'),
        earlier: fieldRefSchema,
        later: fieldRefSchema,
        allowEqual: z.boolean().optional(),
    }),
    z.object({ rule: z.literal('atLeastOne'), fields: z.array(fieldRefSchema).min(2) }),
]);
export type ObjectRule = z.infer<typeof objectRuleSchema>;

export interface FieldGroup {
    fields: BlueprintNode[];
    rules?: ObjectRule[];
}
export type ObjectNode = NodeBase & FieldGroup & { type: 'object' };
export type ListNode = NodeBase & {
    type: 'list';
    item: FieldGroup;
    minItems?: number;
    maxItems?: number;
    uniqueBy?: string;
};
export type BlueprintNode = ScalarNode | ObjectNode | ListNode;
export type Blueprint = FieldGroup;

const fieldGroupShape = () => ({
    fields: z
        .array(blueprintNodeSchema)
        .min(1)
        .max(200)
        .refine((fields) => new Set(fields.map((f) => f.key)).size === fields.length, {
            message: 'Field keys must be unique within a group',
        }),
    rules: z.array(objectRuleSchema).max(50).optional(),
});

const fieldGroupSchema: z.ZodType<FieldGroup> = z.lazy(() => z.object(fieldGroupShape()));

export const blueprintNodeSchema: z.ZodType<BlueprintNode> = z.lazy(() =>
    z.union([
        scalarNodeSchema,
        nodeBaseSchema.extend({ type: z.literal('object'), ...fieldGroupShape() }),
        nodeBaseSchema.extend({
            type: z.literal('list'),
            item: fieldGroupSchema,
            minItems: z.int().min(0).optional(),
            maxItems: z.int().min(1).max(500).optional(),
            uniqueBy: fieldKeySchema.optional(),
        }),
    ]),
);

function depthOf(group: FieldGroup): number {
    const childDepths = group.fields.map((node) => {
        if (node.type === 'object') return depthOf(node);
        if (node.type === 'list') return depthOf(node.item) + 1;
        return 0;
    });
    return 1 + Math.max(0, ...childDepths);
}

export const blueprintSchema = fieldGroupSchema.refine(
    (blueprint) => depthOf(blueprint) <= MAX_BLUEPRINT_DEPTH,
    { message: `Blueprint nesting must not exceed ${MAX_BLUEPRINT_DEPTH} levels` },
);
