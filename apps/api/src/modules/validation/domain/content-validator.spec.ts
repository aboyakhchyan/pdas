import { type Blueprint, blueprintSchema } from '@pdas/core';
import { validateContent } from './content-validator';
import type { ValidationMode } from './interfaces/content-validation.interface';

const label = { hy: 'Դաշտ', en: 'Field', ru: 'Поле' };
const today = new Date(Date.UTC(2026, 9, 7));

const blueprint: Blueprint = blueprintSchema.parse({
    fields: [
        {
            key: 'applicant',
            label,
            type: 'object',
            required: true,
            fields: [
                {
                    key: 'fullName',
                    label,
                    type: 'text',
                    required: true,
                    minLength: 3,
                    maxLength: 120,
                },
                {
                    key: 'birthDate',
                    label,
                    type: 'date',
                    required: true,
                    max: { relativeTo: 'today', years: -18 },
                },
                {
                    key: 'passport',
                    label,
                    type: 'identifier',
                    format: 'am-passport',
                    required: true,
                },
                { key: 'phone', label, type: 'phone', callingCodes: ['374'] },
                { key: 'email', label, type: 'email' },
            ],
            rules: [{ rule: 'atLeastOne', fields: ['phone', 'email'] }],
        },
        {
            key: 'hasRepresentative',
            label,
            type: 'boolean',
        },
        {
            key: 'representative',
            label,
            type: 'text',
            visibleWhen: { op: 'equals', field: 'hasRepresentative', value: true },
            required: { op: 'equals', field: 'hasRepresentative', value: true },
        },
        {
            key: 'vehicles',
            label,
            type: 'list',
            minItems: 1,
            maxItems: 2,
            uniqueBy: 'plate',
            item: {
                fields: [
                    {
                        key: 'plate',
                        label,
                        type: 'identifier',
                        format: 'am-vehicle-plate',
                        required: true,
                    },
                    { key: 'price', label, type: 'money', currencies: ['AMD'], min: 0 },
                ],
            },
        },
        {
            key: 'validity',
            label,
            type: 'object',
            fields: [
                { key: 'from', label, type: 'date' },
                { key: 'until', label, type: 'date' },
            ],
            rules: [{ rule: 'dateOrder', earlier: 'from', later: 'until' }],
        },
        {
            key: 'purpose',
            label,
            type: 'choice',
            multiple: true,
            options: [
                { value: 'sell', label },
                { value: 'register', label },
            ],
        },
    ],
});

const validContent = {
    applicant: {
        fullName: 'Արամ Պետրոսյան',
        birthDate: '1990-05-14',
        passport: 'AK1234567',
        phone: '+37491123456',
    },
    hasRepresentative: false,
    vehicles: [{ plate: '35OS123', price: { amount: 5_000_000, currency: 'AMD' } }],
    validity: { from: '2026-10-07', until: '2027-10-07' },
    purpose: ['sell'],
};

function codesOf(content: Record<string, unknown>, mode: ValidationMode = 'complete') {
    return validateContent(blueprint, content as never, { mode, today }).map(
        ({ path, code }) => `${path.join('.')}:${code}`,
    );
}

describe('validateContent', () => {
    it('accepts complete valid content', () => {
        expect(codesOf(validContent)).toEqual([]);
    });

    it('skips required checks in draft mode but still checks formats', () => {
        expect(codesOf({ applicant: { passport: 'bad' } }, 'draft')).toEqual([
            'applicant.passport:invalidFormat',
        ]);
    });

    it('reports missing required fields in complete mode', () => {
        expect(codesOf({})).toEqual(['applicant:required']);
        expect(codesOf({ ...validContent, applicant: {} })).toEqual([
            'applicant.fullName:required',
            'applicant.birthDate:required',
            'applicant.passport:required',
            'applicant:atLeastOne',
        ]);
    });

    it('rejects unknown fields', () => {
        expect(codesOf({ ...validContent, extra: 1 })).toEqual(['extra:unknownField']);
    });

    it('applies relative date bounds', () => {
        const minor = { ...validContent.applicant, birthDate: '2015-01-01' };
        expect(codesOf({ ...validContent, applicant: minor })).toEqual([
            'applicant.birthDate:dateTooLate',
        ]);
    });

    it('rejects impossible calendar dates', () => {
        const applicant = { ...validContent.applicant, birthDate: '1990-02-30' };
        expect(codesOf({ ...validContent, applicant })).toEqual([
            'applicant.birthDate:invalidDate',
        ]);
    });

    it('validates Armenian phone numbers', () => {
        const applicant = { ...validContent.applicant, phone: '+3749112345' };
        expect(codesOf({ ...validContent, applicant })).toEqual(['applicant.phone:invalidFormat']);
    });

    it('handles conditional visibility and requirement', () => {
        expect(codesOf({ ...validContent, representative: 'Name' })).toEqual([
            'representative:notAllowed',
        ]);
        expect(codesOf({ ...validContent, hasRepresentative: true })).toEqual([
            'representative:required',
        ]);
    });

    it('validates list bounds, items and uniqueness', () => {
        const vehicle = validContent.vehicles[0];
        expect(codesOf({ ...validContent, vehicles: [vehicle, vehicle] })).toEqual([
            'vehicles.1.plate:duplicateItem',
        ]);
        expect(
            codesOf({
                ...validContent,
                vehicles: [vehicle, { plate: '01AB001' }, { plate: '02AB002' }],
            }),
        ).toEqual(['vehicles:tooManyItems']);
        expect(
            codesOf({
                ...validContent,
                vehicles: [{ plate: '35OS123', price: { amount: 1, currency: 'USD' } }],
            }),
        ).toEqual(['vehicles.0.price.currency:invalidCurrency']);
    });

    it('enforces date order between fields', () => {
        expect(
            codesOf({ ...validContent, validity: { from: '2027-01-01', until: '2026-01-01' } }),
        ).toEqual(['validity.until:dateOrder']);
    });

    it('validates multiple choice options', () => {
        expect(codesOf({ ...validContent, purpose: ['sell', 'sell', 'rent'] })).toEqual([
            'purpose.1:duplicateOption',
            'purpose.2:invalidOption',
        ]);
    });

    it('reports type mismatches', () => {
        expect(codesOf({ ...validContent, hasRepresentative: 'yes', vehicles: {} })).toEqual([
            'hasRepresentative:invalidType',
            'vehicles:invalidType',
        ]);
    });
});

describe('blueprintSchema', () => {
    it('rejects duplicate keys within a group', () => {
        const duplicate = { key: 'name', label, type: 'text' };
        expect(blueprintSchema.safeParse({ fields: [duplicate, duplicate] }).success).toBe(false);
    });

    it('rejects nesting deeper than the Firestore-safe limit', () => {
        let group: Record<string, unknown> = { fields: [{ key: 'leaf', label, type: 'text' }] };
        for (let level = 0; level < 9; level++) {
            group = { fields: [{ key: `level${level}`, label, type: 'object', ...group }] };
        }
        expect(blueprintSchema.safeParse(group).success).toBe(false);
    });
});
