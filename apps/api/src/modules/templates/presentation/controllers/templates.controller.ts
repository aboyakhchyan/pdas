import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { TemplateVersionDto } from '@pdas/core';
import { Auth } from '@common/decorators/auth.decorator';
import { CurrentPrincipal } from '@common/decorators/current-principal.decorator';
import { Public } from '@common/decorators/public.decorator';
import type { Principal } from '@common/interfaces/principal.interface';
import { GetTemplateVersion } from '../../application/use-cases/get-template-version.use-case';
import { PublishTemplateVersion } from '../../application/use-cases/publish-template-version.use-case';
import { toTemplateVersionDto } from '../presenters/template-version.presenter';
import { PublishTemplateVersionRequest } from '../requests/publish-template-version.request';
import { TemplateParams, TemplateVersionParams } from '../requests/template-params.request';
import { TemplateVersionResponse } from '../responses/template-version.response';

@ApiTags('templates')
@Controller('templates/:templateId')
export class TemplatesController {
    constructor(
        private readonly getTemplateVersion: GetTemplateVersion,
        private readonly publishTemplateVersion: PublishTemplateVersion,
    ) {}

    @Get()
    @Public()
    @ApiOperation({ summary: 'Latest published version of a template' })
    @ApiOkResponse({ type: TemplateVersionResponse })
    async latest(@Param() { templateId }: TemplateParams): Promise<TemplateVersionDto> {
        return toTemplateVersionDto(await this.getTemplateVersion.execute(templateId));
    }

    @Get('versions/:version')
    @Public()
    @ApiOperation({ summary: 'A specific immutable template version' })
    @ApiOkResponse({ type: TemplateVersionResponse })
    async version(
        @Param() { templateId, version }: TemplateVersionParams,
    ): Promise<TemplateVersionDto> {
        return toTemplateVersionDto(await this.getTemplateVersion.execute(templateId, version));
    }

    @Post('versions')
    @Auth('templates:publish')
    @ApiOperation({ summary: 'Publish a new immutable version of a template' })
    @ApiCreatedResponse({ type: TemplateVersionResponse })
    async publish(
        @CurrentPrincipal() principal: Principal,
        @Param() { templateId }: TemplateParams,
        @Body() input: PublishTemplateVersionRequest,
    ): Promise<TemplateVersionDto> {
        return toTemplateVersionDto(
            await this.publishTemplateVersion.execute(principal, templateId, input),
        );
    }
}
