import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { UnauthenticatedError } from '../errors/domain-error';
import type { Principal, PrincipalRequest } from '../interfaces/principal.interface';

export const CurrentPrincipal = createParamDecorator(
    (_: unknown, context: ExecutionContext): Principal => {
        const { principal } = context.switchToHttp().getRequest<PrincipalRequest>();
        if (!principal) throw new UnauthenticatedError();
        return principal;
    },
);
