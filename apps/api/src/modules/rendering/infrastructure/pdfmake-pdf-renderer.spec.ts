import { PdfmakePdfRenderer } from './pdfmake-pdf-renderer';

describe('PdfmakePdfRenderer', () => {
    const renderer = new PdfmakePdfRenderer();

    it('renders Armenian, Latin and Cyrillic text into a PDF', async () => {
        const pdf = await renderer.render({
            title: 'Լիազորագիր / Power of attorney / Доверенность',
            locale: 'hy',
            issuedAt: new Date('2026-01-01T00:00:00Z'),
            blocks: [
                { kind: 'heading', text: 'Լիազորող', level: 1 },
                { kind: 'fields', rows: [{ label: 'Անուն', value: 'Արամ Պետրոսյան' }] },
            ],
        });

        expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
        expect(pdf.toString('latin1')).toContain('DejaVuSerif');
    });

    it('produces the same bytes for the same document', async () => {
        const document = {
            title: 'Document',
            locale: 'en' as const,
            issuedAt: new Date('2026-01-01T00:00:00Z'),
            blocks: [],
        };

        expect((await renderer.render(document)).equals(await renderer.render(document))).toBe(
            true,
        );
    });
});
