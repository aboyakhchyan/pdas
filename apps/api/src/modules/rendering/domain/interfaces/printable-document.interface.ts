import type { Locale } from '@pdas/core';

/** Layout-free description of a document. Renderers decide how it looks; content is final. */
export interface PrintableDocument {
    title: string;
    locale: Locale;
    /** Fixed timestamp written into the PDF metadata so equal input gives an equal file. */
    issuedAt: Date;
    blocks: PrintableBlock[];
}

export type PrintableBlock =
    | { kind: 'heading'; text: string; level: HeadingLevel }
    | { kind: 'fields'; rows: PrintableField[] };

export type HeadingLevel = 1 | 2 | 3;

export interface PrintableField {
    label: string;
    value: string;
}
