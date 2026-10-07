import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import {
    ApiAcceptedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import type { MailTemplateDto, MailTemplateSummaryDto } from '@pdas/core';
import { Auth } from '@common/decorators/auth.decorator';
import { CurrentPrincipal } from '@common/decorators/current-principal.decorator';
import type { Principal } from '@common/interfaces/principal.interface';
import { DeleteMailTemplate } from '../../application/use-cases/delete-mail-template.use-case';
import { GetMailTemplate } from '../../application/use-cases/get-mail-template.use-case';
import { ListMailTemplates } from '../../application/use-cases/list-mail-templates.use-case';
import { SendTestMail } from '../../application/use-cases/send-test-mail.use-case';
import { UpsertMailTemplate } from '../../application/use-cases/upsert-mail-template.use-case';
import { toMailTemplateDto, toMailTemplateSummaryDto } from '../presenters/mail-template.presenter';
import { MailTemplateParams } from '../requests/mail-template-params.request';
import { SendTestMailRequest } from '../requests/send-test-mail.request';
import { UpsertMailTemplateRequest } from '../requests/upsert-mail-template.request';
import {
    MailTemplateResponse,
    MailTemplateSummaryResponse,
} from '../responses/mail-template.response';

@ApiTags('mail-templates')
@Auth('mail-templates:manage')
@Controller('mail-templates')
export class MailTemplatesController {
    constructor(
        private readonly listMailTemplates: ListMailTemplates,
        private readonly getMailTemplate: GetMailTemplate,
        private readonly upsertMailTemplate: UpsertMailTemplate,
        private readonly deleteMailTemplate: DeleteMailTemplate,
        private readonly sendTestMail: SendTestMail,
    ) {}

    @Get()
    @ApiOperation({ summary: 'All email templates with their locales' })
    @ApiOkResponse({ type: [MailTemplateSummaryResponse] })
    async list(): Promise<MailTemplateSummaryDto[]> {
        return (await this.listMailTemplates.execute()).map(toMailTemplateSummaryDto);
    }

    @Get(':name/:locale')
    @ApiOperation({ summary: 'One template translation' })
    @ApiOkResponse({ type: MailTemplateResponse })
    async get(@Param() key: MailTemplateParams): Promise<MailTemplateDto> {
        return toMailTemplateDto(await this.getMailTemplate.execute(key));
    }

    @Put(':name/:locale')
    @ApiOperation({
        summary: 'Create or replace a template translation',
        description: 'Subject, HTML and text are Handlebars templates, e.g. `{{user.name}}`.',
    })
    @ApiOkResponse({ type: MailTemplateResponse })
    async upsert(
        @CurrentPrincipal() principal: Principal,
        @Param() key: MailTemplateParams,
        @Body() input: UpsertMailTemplateRequest,
    ): Promise<MailTemplateDto> {
        return toMailTemplateDto(await this.upsertMailTemplate.execute(principal, key, input));
    }

    @Delete(':name/:locale')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a template translation' })
    @ApiNoContentResponse()
    async remove(@Param() key: MailTemplateParams): Promise<void> {
        await this.deleteMailTemplate.execute(key);
    }

    @Post(':name/:locale/test')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({ summary: 'Queue this template to your own email address with sample data' })
    @ApiAcceptedResponse()
    async test(
        @CurrentPrincipal() principal: Principal,
        @Param() key: MailTemplateParams,
        @Body() input: SendTestMailRequest,
    ): Promise<void> {
        await this.sendTestMail.execute(principal, key, input);
    }
}
