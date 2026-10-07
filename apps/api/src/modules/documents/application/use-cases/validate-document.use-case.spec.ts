import { documentsFixture, owner } from '../../testing/documents-fixture';
import { ValidateDocument } from './validate-document.use-case';

describe('ValidateDocument', () => {
    it('reports what is still required before the document is ready', async () => {
        const { access, templates, validation, draft } = await documentsFixture();

        const report = await new ValidateDocument(access, templates, validation).execute(
            owner,
            draft.id,
        );

        expect(report).toEqual({
            isComplete: false,
            issues: [{ path: ['principal'], code: 'required' }],
        });
    });
});
