import type { I18nService } from 'nestjs-i18n';
import { ContentInvalidError, NotFoundError } from '@common/errors/domain-error';
import { PdfRendering } from '@modules/rendering/application/services/pdf-rendering.service';
import { PdfRenderer } from '@modules/rendering/domain/ports/pdf-renderer.port';
import { documentsFixture, owner, stranger } from '../../testing/documents-fixture';
import { DocumentPrintout } from '../services/document-printout.service';
import { GetDocumentPdf } from './get-document-pdf.use-case';
import { UpdateDocumentContent } from './update-document-content.use-case';

class CountingRenderer extends PdfRenderer {
    renders = 0;

    async render(): Promise<Buffer> {
        this.renders += 1;
        return Buffer.from('%PDF-');
    }
}

describe('GetDocumentPdf', () => {
    async function setup() {
        const fixture = await documentsFixture();
        const { access, documents, templates, validation, storage } = fixture;
        const renderer = new CountingRenderer();
        const printout = new DocumentPrintout({
            t: (key: string) => key,
        } as unknown as I18nService);
        const getPdf = new GetDocumentPdf(
            access,
            templates,
            validation,
            printout,
            new PdfRendering(renderer),
            storage,
        );
        const update = new UpdateDocumentContent(access, documents, templates, validation);
        return { ...fixture, renderer, getPdf, update };
    }

    it('renders a complete document once per revision and links to the stored file', async () => {
        const { getPdf, update, renderer, storage, draft, completePowerOfAttorney } = await setup();
        const ready = await update.execute(owner, draft.id, {
            content: completePowerOfAttorney,
            revision: 1,
        });

        const first = await getPdf.execute(owner, ready.id);
        await getPdf.execute(owner, ready.id);

        expect(renderer.renders).toBe(1);
        expect(storage.files.get(ready.pdfPath)).toMatchObject({ contentType: 'application/pdf' });
        expect(first.url).toContain(ready.pdfPath);
    });

    it('refuses incomplete documents and lists what is missing', async () => {
        const { getPdf, draft } = await setup();

        const error = await getPdf.execute(owner, draft.id).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(ContentInvalidError);
        expect((error as ContentInvalidError).issues.length).toBeGreaterThan(0);
    });

    it('hides documents of other users', async () => {
        const { getPdf, draft } = await setup();

        await expect(getPdf.execute(stranger, draft.id)).rejects.toBeInstanceOf(NotFoundError);
    });
});
