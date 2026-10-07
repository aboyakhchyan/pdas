import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { UserDto } from '@pdas/core';
import { Auth } from '@common/decorators/auth.decorator';
import { CurrentPrincipal } from '@common/decorators/current-principal.decorator';
import type { Principal } from '@common/interfaces/principal.interface';
import { AssignRole } from '../../application/use-cases/assign-role.use-case';
import { toUserDto } from '../presenters/user.presenter';
import { AssignRoleRequest } from '../requests/assign-role.request';
import { UserParams } from '../requests/user-params.request';
import { UserResponse } from '../responses/user.response';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly assignRole: AssignRole) {}

    @Patch(':userId/role')
    @Auth('users:assign-role')
    @ApiOperation({ summary: 'Assign a role; the user must sign in again to receive it' })
    @ApiOkResponse({ type: UserResponse })
    async changeRole(
        @CurrentPrincipal() principal: Principal,
        @Param() { userId }: UserParams,
        @Body() { role }: AssignRoleRequest,
    ): Promise<UserDto> {
        return toUserDto(await this.assignRole.execute(principal, userId, role));
    }
}
