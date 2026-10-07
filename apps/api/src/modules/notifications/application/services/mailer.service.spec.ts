import { NotFoundError } from '@common/errors/domain-error';
import { MailTemplate } from '../../domain/entities/mail-template.entity';
import { InMemoryMailOutbox } from '../../testing/in-memory-mail-outbox';
import { InMemoryMailTemplateRepository } from '../../testing/in-memory-mail-template.repository';
import { Mailer } from './mailer.service';

describe('Mailer', () => {
    async function setup() {
        const templates = new InMemoryMailTemplateRepository();
        const outbox = new InMemoryMailOutbox();
        const content = {
            subject: 'Ձեր փաստաթուղթը պատրաստ է',
            html: '<p>{{title}}</p>',
            text: null,
        };
        await templates.save(
            MailTemplate.write(
                { name: 'document-ready', locale: 'hy' },
                content,
                'admin-1',
                new Date(),
            ),
        );
        return { outbox, mailer: new Mailer(templates, outbox) };
    }

    it('queues the template in the recipient language', async () => {
        const { mailer, outbox } = await setup();

        await mailer.send({
            to: 'aram@example.am',
            template: 'document-ready',
            locale: 'hy',
            data: { title: 'Լիազորագիր' },
        });

        expect(outbox.sent).toEqual([
            {
                to: ['aram@example.am'],
                template: { name: 'document-ready', locale: 'hy' },
                data: { title: 'Լիազորագիր' },
                replyTo: undefined,
            },
        ]);
    });

    it('falls back to the default locale when a translation is missing', async () => {
        const { mailer, outbox } = await setup();

        await mailer.send({
            to: ['a@example.com', 'b@example.com'],
            template: 'document-ready',
            locale: 'ru',
        });

        expect(outbox.sent[0]?.template).toEqual({ name: 'document-ready', locale: 'hy' });
    });

    it('fails for an unknown template', async () => {
        const { mailer } = await setup();

        await expect(
            mailer.send({ to: 'a@example.com', template: 'missing', locale: 'en' }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
