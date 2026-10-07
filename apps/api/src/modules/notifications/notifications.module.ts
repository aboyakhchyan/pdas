import { Module } from '@nestjs/common';
import { Mailer } from './application/services/mailer.service';
import { DeleteMailTemplate } from './application/use-cases/delete-mail-template.use-case';
import { GetMailTemplate } from './application/use-cases/get-mail-template.use-case';
import { ListMailTemplates } from './application/use-cases/list-mail-templates.use-case';
import { SendTestMail } from './application/use-cases/send-test-mail.use-case';
import { UpsertMailTemplate } from './application/use-cases/upsert-mail-template.use-case';
import { MailOutbox } from './domain/ports/mail-outbox.port';
import { MailTemplateRepository } from './domain/ports/mail-template.repository';
import { FirestoreMailOutbox } from './infrastructure/firestore-mail-outbox';
import { FirestoreMailTemplateRepository } from './infrastructure/firestore-mail-template.repository';
import { MailTemplatesController } from './presentation/controllers/mail-templates.controller';

@Module({
    controllers: [MailTemplatesController],
    providers: [
        Mailer,
        ListMailTemplates,
        GetMailTemplate,
        UpsertMailTemplate,
        DeleteMailTemplate,
        SendTestMail,
        { provide: MailTemplateRepository, useClass: FirestoreMailTemplateRepository },
        { provide: MailOutbox, useClass: FirestoreMailOutbox },
    ],
    exports: [Mailer],
})
export class NotificationsModule {}
