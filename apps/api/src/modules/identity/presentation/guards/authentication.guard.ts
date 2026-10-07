import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestContext } from '@common/context/request-context';
import { Public } from '@common/decorators/public.decorator';
import { UnauthenticatedError } from '@common/errors/domain-error';
import type { PrincipalRequest } from '@common/interfaces/principal.interface';
import { IdentityProvider } from '../../domain/ports/identity-provider.port';

const BEARER_PREFIX = 'Bearer ';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly identityProvider: IdentityProvider,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride(Public, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest<PrincipalRequest>();
        const header = request.headers.authorization;
        if (!header?.startsWith(BEARER_PREFIX)) throw new UnauthenticatedError();

        request.principal = await this.identityProvider.verifyAccessToken(
            header.slice(BEARER_PREFIX.length).trim(),
        );
        RequestContext.assignUser(request.principal.uid);
        return true;
    }
}
