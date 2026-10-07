import { Module } from '@nestjs/common';
import { PdfRendering } from './application/services/pdf-rendering.service';
import { PdfRenderer } from './domain/ports/pdf-renderer.port';
import { PdfmakePdfRenderer } from './infrastructure/pdfmake-pdf-renderer';

@Module({
    providers: [PdfRendering, { provide: PdfRenderer, useClass: PdfmakePdfRenderer }],
    exports: [PdfRendering],
})
export class RenderingModule {}
