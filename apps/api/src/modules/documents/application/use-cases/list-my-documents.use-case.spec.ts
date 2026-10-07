import { documentsFixture, owner, stranger } from '../../testing/documents-fixture';
import { ListMyDocuments } from './list-my-documents.use-case';

describe('ListMyDocuments', () => {
    it('lists only the caller’s documents without content', async () => {
        const { documents, draft } = await documentsFixture();
        const listMyDocuments = new ListMyDocuments(documents);

        const page = await listMyDocuments.execute(owner, { limit: 20 });

        expect(page.items.map((item) => item.id)).toEqual([draft.id]);
        expect(page.items[0]).not.toHaveProperty('content');
        expect((await listMyDocuments.execute(stranger, { limit: 20 })).items).toEqual([]);
    });
});
