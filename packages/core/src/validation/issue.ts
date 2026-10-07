import { z } from 'zod';

export const VALIDATION_CODES = [
    'required',
    'notAllowed',
    'unknownField',
    'invalidType',
    'tooShort',
    'tooLong',
    'tooSmall',
    'tooBig',
    'notInteger',
    'patternMismatch',
    'invalidOption',
    'duplicateOption',
    'invalidFormat',
    'invalidDate',
    'dateTooEarly',
    'dateTooLate',
    'invalidCurrency',
    'tooFewItems',
    'tooManyItems',
    'duplicateItem',
    'dateOrder',
    'atLeastOne',
    'contentTooLarge',
] as const;
export const validationCodeSchema = z.enum(VALIDATION_CODES);
export type ValidationCode = z.infer<typeof validationCodeSchema>;

export const validationPathSchema = z.array(z.union([z.string(), z.number().int()]));
export type ValidationPath = z.infer<typeof validationPathSchema>;

export const validationIssueSchema = z.object({
    path: validationPathSchema,
    code: validationCodeSchema,
    params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});
export type ValidationIssue = z.infer<typeof validationIssueSchema>;
