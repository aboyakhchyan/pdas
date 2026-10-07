import { dirname, join } from 'node:path';
import { Injectable } from '@nestjs/common';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import type {
    HeadingLevel,
    PrintableBlock,
    PrintableDocument,
} from '../domain/interfaces/printable-document.interface';
import { PdfRenderer } from '../domain/ports/pdf-renderer.port';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- pdfmake exports a class instance; named or namespace imports would lose `this`
import pdfmake = require('pdfmake');

const FONT_FAMILY = 'DejaVuSerif';
const FONTS_DIRECTORY = join(dirname(require.resolve('dejavu-fonts-ttf/package.json')), 'ttf');
const A4_MARGINS: [number, number, number, number] = [56, 56, 56, 64];
const HEADING_STYLE: Record<HeadingLevel, string> = { 1: 'heading1', 2: 'heading2', 3: 'heading3' };

/**
 * Renders with pdfmake (built on pdfkit). DejaVu Serif covers Armenian, Latin and Cyrillic, so
 * hy, en and ru documents use one embedded font. Remote and arbitrary local file access is
 * disabled: documents can only reference the bundled fonts.
 */
@Injectable()
export class PdfmakePdfRenderer extends PdfRenderer {
    constructor() {
        super();
        pdfmake.setFonts({
            [FONT_FAMILY]: {
                normal: join(FONTS_DIRECTORY, 'DejaVuSerif.ttf'),
                bold: join(FONTS_DIRECTORY, 'DejaVuSerif-Bold.ttf'),
                italics: join(FONTS_DIRECTORY, 'DejaVuSerif-Italic.ttf'),
                bolditalics: join(FONTS_DIRECTORY, 'DejaVuSerif-BoldItalic.ttf'),
            },
        });
        pdfmake.setUrlAccessPolicy(() => false);
        pdfmake.setLocalAccessPolicy((path) => path.startsWith(FONTS_DIRECTORY));
    }

    render(document: PrintableDocument): Promise<Buffer> {
        return pdfmake.createPdf(toDefinition(document)).getBuffer();
    }
}

function toDefinition({ title, issuedAt, blocks }: PrintableDocument): TDocumentDefinitions {
    return {
        pageSize: 'A4',
        pageMargins: A4_MARGINS,
        info: { title, creator: 'PDAS', producer: 'PDAS', creationDate: issuedAt },
        defaultStyle: { font: FONT_FAMILY, fontSize: 11, lineHeight: 1.25 },
        styles: {
            title: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 18] },
            heading1: { fontSize: 13, bold: true, margin: [0, 14, 0, 6] },
            heading2: { fontSize: 12, bold: true, margin: [0, 10, 0, 4] },
            heading3: { fontSize: 11, bold: true, italics: true, margin: [0, 8, 0, 4] },
            label: { bold: true },
        },
        footer: (currentPage, pageCount) => ({
            text: `${currentPage} / ${pageCount}`,
            alignment: 'center',
            fontSize: 9,
            margin: [0, 24, 0, 0],
        }),
        content: [{ text: title, style: 'title' }, ...blocks.map(toContent)],
    };
}

function toContent(block: PrintableBlock): Content {
    switch (block.kind) {
        case 'heading':
            return { text: block.text, style: HEADING_STYLE[block.level] };
        case 'fields':
            return {
                table: {
                    widths: ['38%', '*'],
                    dontBreakRows: true,
                    body: block.rows.map(({ label, value }) => [
                        { text: label, style: 'label' },
                        value,
                    ]),
                },
                layout: 'lightHorizontalLines',
                margin: [0, 0, 0, 8],
            };
    }
}
