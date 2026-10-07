import type { PrintableDocument } from '../interfaces/printable-document.interface';

export abstract class PdfRenderer {
    abstract render(document: PrintableDocument): Promise<Buffer>;
}
