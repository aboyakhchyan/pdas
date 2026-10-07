import { Reflector } from '@nestjs/core';
import type { Permission } from '@pdas/core';

export const RequirePermissions = Reflector.createDecorator<Permission[]>();
