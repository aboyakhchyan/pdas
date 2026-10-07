import { Module } from '@nestjs/common';
import { GetTemplateVersion } from './application/use-cases/get-template-version.use-case';
import { PublishTemplateVersion } from './application/use-cases/publish-template-version.use-case';
import { TemplateRepository } from './domain/ports/template.repository';
import { FirestoreTemplateRepository } from './infrastructure/firestore-template.repository';
import { TemplatesController } from './presentation/controllers/templates.controller';

@Module({
    controllers: [TemplatesController],
    providers: [
        GetTemplateVersion,
        PublishTemplateVersion,
        { provide: TemplateRepository, useClass: FirestoreTemplateRepository },
    ],
    exports: [GetTemplateVersion],
})
export class TemplatesModule {}
