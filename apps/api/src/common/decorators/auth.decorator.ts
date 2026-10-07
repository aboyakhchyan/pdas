import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Permission } from '@pdas/core';
import { ErrorResponse } from '../responses/error.response';
import { RequirePermissions } from './require-permissions.decorator';

/**
 * Marks an endpoint as private: the caller must be signed in and hold every listed permission
 * (granted to roles in `ROLE_PERMISSIONS`).
 */
export function Auth(...permissions: Permission[]): MethodDecorator & ClassDecorator {
    return applyDecorators(
        RequirePermissions(permissions),
        ApiBearerAuth(),
        ApiUnauthorizedResponse({ type: ErrorResponse }),
        ApiForbiddenResponse({ type: ErrorResponse }),
    );
}
