import { Injectable } from '@nestjs/common';
import { NotFoundError } from '@common/errors/domain-error';
import type { TemplateVersion } from '../../domain/interfaces/template-version.interface';
import { TemplateRepository } from '../../domain/ports/template.repository';

@Injectable()
export class GetTemplateVersion {
    constructor(private readonly templates: TemplateRepository) {}

    async execute(templateId: string, version?: number): Promise<TemplateVersion> {
        const template =
            version === undefined
                ? await this.templates.findLatest(templateId)
                : await this.templates.findVersion(templateId, version);
        if (!template) throw new NotFoundError();
        return template;
    }
}
