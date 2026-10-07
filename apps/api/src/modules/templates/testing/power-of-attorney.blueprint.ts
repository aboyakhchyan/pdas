import { type Blueprint, blueprintSchema } from '@pdas/core';

const label = { hy: 'Դաշտ', en: 'Field', ru: 'Поле' };

export const powerOfAttorneyBlueprint: Blueprint = blueprintSchema.parse({
    fields: [
        {
            key: 'principal',
            label,
            type: 'object',
            required: true,
            fields: [
                { key: 'fullName', label, type: 'text', required: true },
                {
                    key: 'passport',
                    label,
                    type: 'identifier',
                    format: 'am-passport',
                    required: true,
                },
            ],
        },
    ],
});

export const completePowerOfAttorney = {
    principal: { fullName: 'Արամ Պետրոսյան', passport: 'AK1234567' },
};
