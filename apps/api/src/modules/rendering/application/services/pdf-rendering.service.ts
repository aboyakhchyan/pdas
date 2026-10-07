import { Injectable } from '@nestjs/common';
import type { PrintableDocument } from '../../domain/interfaces/printable-document.interface';
import { PdfRenderer } from '../../domain/ports/pdf-renderer.port';

/** Public API of the rendering context: turns a `PrintableDocument` into PDF bytes. */
@Injectable()
export class PdfRendering {
    constructor(private readonly renderer: PdfRenderer) {}

    render(document: PrintableDocument): Promise<Buffer> {
        return this.renderer.render(document);
    }
}
