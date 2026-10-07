import type {
    MailTemplateContent,
    MailTemplateKey,
    MailTemplateProps,
} from '../interfaces/mail-template.interface';

export class MailTemplate {
    private constructor(private props: MailTemplateProps) {}

    static write(
        key: MailTemplateKey,
        content: MailTemplateContent,
        author: string,
        now: Date,
    ): MailTemplate {
        return new MailTemplate({ ...key, ...content, updatedBy: author, updatedAt: now });
    }

    static restore(props: MailTemplateProps): MailTemplate {
        return new MailTemplate({ ...props });
    }

    get key(): MailTemplateKey {
        return { name: this.props.name, locale: this.props.locale };
    }

    revise(content: MailTemplateContent, author: string, now: Date): void {
        this.props = { ...this.props, ...content, updatedBy: author, updatedAt: now };
    }

    toProps(): Readonly<MailTemplateProps> {
        return { ...this.props };
    }
}
