import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission } from '@pdas/core';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { AccessDeniedError } from '@common/errors/domain-error';
import type { PrincipalRequest } from '@common/interfaces/principal.interface';

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride(RequirePermissions, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!required?.length) return true;

        const { principal } = context.switchToHttp().getRequest<PrincipalRequest>();
        if (
            !principal ||
            !required.every((permission) => hasPermission(principal.role, permission))
        ) {
            throw new AccessDeniedError();
        }
        return true;
    }
}
