import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { I18n, type I18nContext } from 'nestjs-i18n';
import { Public } from '@common/decorators/public.decorator';
import { HealthResponse } from '../responses/health.response';

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
    @Get()
    @ApiOkResponse({ type: HealthResponse })
    check(@I18n() i18n: I18nContext): HealthResponse {
        return {
            status: 'ok',
            message: i18n.t('common.health.ok'),
            uptime: process.uptime(),
        };
    }
}
