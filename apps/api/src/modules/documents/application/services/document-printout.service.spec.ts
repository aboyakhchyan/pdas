import { blueprintSchema } from '@pdas/core';
import type { I18nService } from 'nestjs-i18n';
import { Document } from '../../domain/entities/document.entity';
import { DocumentPrintout } from './document-printout.service';

const label = (hy: string) => ({ hy, en: hy, ru: hy });

const template = {
    templateId: 'vehicle-sale',
    version: 1,
    title: label('Պայմանագիր'),
    publishedAt: new Date(),
    publishedBy: 'admin-1',
    blueprint: blueprintSchema.parse({
        fields: [
            {
                key: 'seller',
                label: label('Վաճառող'),
                type: 'object',
                fields: [
                    { key: 'fullName', label: label('Անուն'), type: 'text' },
                    { key: 'resident', label: label('Ռեզիդենտ'), type: 'boolean' },
                ],
            },
            { key: 'price', label: label('Գին'), type: 'money' },
            { key: 'signedOn', label: label('Ամսաթիվ'), type: 'date' },
            {
                key: 'payment',
                label: label('Վճարում'),
                type: 'choice',
                options: [{ value: 'cash', label: label('Կանխիկ') }],
            },
            { key: 'notes', label: label('Նշումներ'), type: 'text' },
        ],
    }),
};

function documentWith(content: Record<string, unknown>) {
    const now = new Date('2026-03-01T10:00:00Z');
    return Document.create(
        {
            id: 'doc-1',
            ownerId: 'owner-1',
            templateId: 'vehicle-sale',
            templateVersion: 1,
            title: 'Մեքենայի վաճառք',
            locale: 'hy',
            status: 'ready',
            content: content as Document['content'],
        },
        now,
    );
}

describe('DocumentPrintout', () => {
    const i18n = {
        t: (key: string) => (key === 'pdf.yes' ? 'Այո' : 'Ոչ'),
    } as unknown as I18nService;
    const printout = new DocumentPrintout(i18n);

    it('lays out content by the blueprint in the document locale', () => {
        const printable = printout.compose(
            documentWith({
                seller: { fullName: 'Արամ Պետրոսյան', resident: true },
                price: { amount: 1_500_000_00, currency: 'AMD' },
                signedOn: '2026-03-01',
                payment: 'cash',
                notes: '   ',
            }),
            template,
        );

        expect(printable).toMatchObject({ title: 'Մեքենայի վաճառք', locale: 'hy' });
        expect(printable.blocks).toEqual([
            { kind: 'heading', text: 'Վաճառող', level: 1 },
            {
                kind: 'fields',
                rows: [
                    { label: 'Անուն', value: 'Արամ Պետրոսյան' },
                    { label: 'Ռեզիդենտ', value: 'Այո' },
                ],
            },
            {
                kind: 'fields',
                rows: [
                    { label: 'Գին', value: expect.stringContaining('AMD') },
                    { label: 'Ամսաթիվ', value: expect.stringContaining('2026') },
                    { label: 'Վճարում', value: 'Կանխիկ' },
                ],
            },
        ]);
    });

    it('formats money from minor units with the locale conventions', () => {
        const printable = printout.compose(
            documentWith({ price: { amount: 12_345, currency: 'USD' } }),
            template,
        );

        expect(printable.blocks[0]).toMatchObject({
            rows: [{ value: expect.stringMatching(/^123,45\sUSD$/) }],
        });
    });
});
