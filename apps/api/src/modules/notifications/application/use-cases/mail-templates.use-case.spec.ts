import { NotFoundError, RequestInvalidError } from '@common/errors/domain-error';
import { principalOf } from '@testing/principal';
import { InMemoryMailOutbox } from '../../testing/in-memory-mail-outbox';
import { InMemoryMailTemplateRepository } from '../../testing/in-memory-mail-template.repository';
import { DeleteMailTemplate } from './delete-mail-template.use-case';
import { SendTestMail } from './send-test-mail.use-case';
import { UpsertMailTemplate } from './upsert-mail-template.use-case';

describe('mail template management', () => {
    const key = { name: 'welcome', locale: 'en' as const };
    const admin = principalOf({
        uid: 'admin-1',
        role: 'admin',
        identity: { ...principalOf().identity, email: 'admin@pdas.am' },
    });

    function setup() {
        const templates = new InMemoryMailTemplateRepository();
        const outbox = new InMemoryMailOutbox();
        return {
            templates,
            outbox,
            upsert: new UpsertMailTemplate(templates),
            remove: new DeleteMailTemplate(templates),
            sendTest: new SendTestMail(templates, outbox),
        };
    }

    it('creates a template and later revises it in place', async () => {
        const { upsert, templates } = setup();

        await upsert.execute(admin, key, { subject: 'Welcome', html: '<p>Hi</p>' });
        const revised = await upsert.execute(admin, key, {
            subject: 'Welcome, {{name}}',
            html: '<p>Hi {{name}}</p>',
            text: 'Hi {{name}}',
        });

        expect(revised.toProps()).toMatchObject({
            subject: 'Welcome, {{name}}',
            text: 'Hi {{name}}',
            updatedBy: 'admin-1',
        });
        expect(templates.templates.size).toBe(1);
    });

    it('sends a test email to the author only', async () => {
        const { upsert, sendTest, outbox } = setup();
        await upsert.execute(admin, key, { subject: 'Welcome', html: '<p>Hi</p>' });

        await sendTest.execute(admin, key, { data: { name: 'Aram' } });

        expect(outbox.sent).toEqual([
            { to: ['admin@pdas.am'], template: key, data: { name: 'Aram' } },
        ]);
    });

    it('cannot send a test to an account without email', async () => {
        const { upsert, sendTest } = setup();
        await upsert.execute(admin, key, { subject: 'Welcome', html: '<p>Hi</p>' });

        await expect(sendTest.execute(principalOf(), key, { data: {} })).rejects.toBeInstanceOf(
            RequestInvalidError,
        );
    });

    it('fails to delete or test a template that does not exist', async () => {
        const { remove, sendTest } = setup();

        await expect(remove.execute(key)).rejects.toBeInstanceOf(NotFoundError);
        await expect(sendTest.execute(admin, key, { data: {} })).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });
});
