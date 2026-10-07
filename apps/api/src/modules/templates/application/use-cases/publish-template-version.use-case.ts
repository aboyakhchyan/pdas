import { Injectable } from '@nestjs/common';
import type { PublishTemplateVersionInput } from '@pdas/core';
import type { Principal } from '@common/interfaces/principal.interface';
import type { TemplateVersion } from '../../domain/interfaces/template-version.interface';
import { TemplateRepository } from '../../domain/ports/template.repository';

@Injectable()
export class PublishTemplateVersion {
    constructor(private readonly templates: TemplateRepository) {}

    execute(
        publisher: Principal,
        templateId: string,
        input: PublishTemplateVersionInput,
    ): Promise<TemplateVersion> {
        return this.templates.publish(
            { templateId, ...input, publishedBy: publisher.uid },
            new Date(),
        );
    }
}
