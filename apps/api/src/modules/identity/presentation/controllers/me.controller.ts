import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DEFAULT_LOCALE, localeSchema, type UserDto } from '@pdas/core';
import { I18nLang } from 'nestjs-i18n';
import { Auth } from '@common/decorators/auth.decorator';
import { CurrentPrincipal } from '@common/decorators/current-principal.decorator';
import type { Principal } from '@common/interfaces/principal.interface';
import { SyncCurrentUser } from '../../application/use-cases/sync-current-user.use-case';
import { UpdateProfile } from '../../application/use-cases/update-profile.use-case';
import { toUserDto } from '../presenters/user.presenter';
import { UpdateProfileRequest } from '../requests/update-profile.request';
import { UserResponse } from '../responses/user.response';

@ApiTags('me')
@Controller('me')
export class MeController {
    constructor(
        private readonly syncCurrentUser: SyncCurrentUser,
        private readonly updateProfile: UpdateProfile,
    ) {}

    @Get()
    @Auth('profile:read')
    @ApiOperation({ summary: 'Current user profile, registered on first call after sign-in' })
    @ApiOkResponse({ type: UserResponse })
    async get(
        @CurrentPrincipal() principal: Principal,
        @I18nLang() lang: string,
    ): Promise<UserDto> {
        const locale = localeSchema.catch(DEFAULT_LOCALE).parse(lang);
        return toUserDto(await this.syncCurrentUser.execute(principal, locale));
    }

    @Patch()
    @Auth('profile:update')
    @ApiOperation({ summary: 'Update display name or preferred locale' })
    @ApiOkResponse({ type: UserResponse })
    async update(
        @CurrentPrincipal() principal: Principal,
        @Body() changes: UpdateProfileRequest,
    ): Promise<UserDto> {
        return toUserDto(await this.updateProfile.execute(principal.uid, changes));
    }
}
