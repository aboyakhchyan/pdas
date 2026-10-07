import { InMemoryFileStorage } from '@testing/in-memory-file-storage';
import { principalOf } from '@testing/principal';
import { GetTemplateVersion } from '@modules/templates/application/use-cases/get-template-version.use-case';
import { InMemoryTemplateRepository } from '@modules/templates/testing/in-memory-template.repository';
import {
    completePowerOfAttorney,
    powerOfAttorneyBlueprint,
} from '@modules/templates/testing/power-of-attorney.blueprint';
import { ContentValidationService } from '@modules/validation/application/services/content-validation.service';
import { DocumentAccess } from '../application/services/document-access.service';
import { CreateDocument } from '../application/use-cases/create-document.use-case';
import { InMemoryDocumentRepository } from './in-memory-document.repository';

export const owner = principalOf({ uid: 'owner-1' });
export const stranger = principalOf({ uid: 'stranger-1' });
export const admin = principalOf({ uid: 'admin-1', role: 'admin' });

export async function documentsFixture() {
    const documents = new InMemoryDocumentRepository();
    const storage = new InMemoryFileStorage();
    const templateRepository = new InMemoryTemplateRepository();
    await templateRepository.publish(
        {
            templateId: 'power-of-attorney',
            title: { hy: 'Լիազորագիր', en: 'Power of attorney', ru: 'Доверенность' },
            blueprint: powerOfAttorneyBlueprint,
            publishedBy: 'admin-1',
        },
        new Date(),
    );
    const templates = new GetTemplateVersion(templateRepository);
    const validation = new ContentValidationService();
    const access = new DocumentAccess(documents);

    const draft = await new CreateDocument(documents, templates, validation).execute(owner, {
        templateId: 'power-of-attorney',
        title: 'Լիազորագիր',
        locale: 'hy',
        content: {},
    });

    return { documents, storage, templates, validation, access, draft, completePowerOfAttorney };
}
