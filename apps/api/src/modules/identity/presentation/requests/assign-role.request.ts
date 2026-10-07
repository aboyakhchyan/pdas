import { type AssignRoleInput, assignRoleSchema, type Role } from '@pdas/core';
import { ContractField } from '@common/decorators/contract.decorator';

export class AssignRoleRequest implements AssignRoleInput {
    @ContractField(assignRoleSchema.shape.role)
    role: Role;
}
