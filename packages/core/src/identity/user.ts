import { z } from 'zod';
import { localeSchema } from '../constants/locale';
import { roleSchema } from './access';

export const AUTH_PROVIDERS = ['phone', 'google.com', 'apple.com'] as const;
export const authProviderSchema = z.enum(AUTH_PROVIDERS);
export type AuthProvider = z.infer<typeof authProviderSchema>;

export const userIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);

export const userSchema = z.object({
    id: z.string(),
    email: z.email().nullable(),
    phoneNumber: z.string().nullable(),
    displayName: z.string().nullable(),
    photoUrl: z.url().nullable(),
    role: roleSchema,
    locale: localeSchema,
    providers: z.array(authProviderSchema),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});
export type UserDto = z.infer<typeof userSchema>;

export const updateProfileSchema = z
    .object({
        displayName: z.string().trim().min(1).max(120).optional(),
        locale: localeSchema.optional(),
    })
    .refine((profile) => Object.values(profile).some((value) => value !== undefined), {
        message: 'At least one field is required',
    });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const assignRoleSchema = z.object({ role: roleSchema });
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
