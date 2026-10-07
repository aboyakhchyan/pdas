import { z } from 'zod';

export const ROLES = ['user', 'admin', 'super-admin'] as const;
export const roleSchema = z.enum(ROLES);
export type Role = z.infer<typeof roleSchema>;
export const DEFAULT_ROLE: Role = 'user';

export const PERMISSIONS = [
    'profile:read',
    'profile:update',
    'documents:create',
    'documents:read',
    'documents:update',
    'documents:delete',
    'documents:read:any',
    'templates:publish',
    'mail-templates:manage',
    'users:assign-role',
] as const;
export const permissionSchema = z.enum(PERMISSIONS);
export type Permission = z.infer<typeof permissionSchema>;

const memberPermissions: readonly Permission[] = [
    'profile:read',
    'profile:update',
    'documents:create',
    'documents:read',
    'documents:update',
    'documents:delete',
];

const adminPermissions: readonly Permission[] = [
    ...memberPermissions,
    'documents:read:any',
    'templates:publish',
    'mail-templates:manage',
];

export const ROLE_PERMISSIONS: Readonly<Record<Role, readonly Permission[]>> = {
    user: memberPermissions,
    admin: adminPermissions,
    'super-admin': PERMISSIONS,
};

export function hasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role].includes(permission);
}
