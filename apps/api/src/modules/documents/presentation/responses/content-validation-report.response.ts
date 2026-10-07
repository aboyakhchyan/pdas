import { ApiProperty } from '@nestjs/swagger';
import {
    type ContentValidationReportDto,
    contentValidationReportSchema,
    type ValidationCode,
    type ValidationIssue,
    validationIssueSchema,
    type ValidationPath,
} from '@pdas/core';
import { ContractProperty } from '@common/decorators/contract.decorator';

const issue = validationIssueSchema.shape;

export class ValidationIssueResponse implements ValidationIssue {
    @ContractProperty(issue.path)
    path: ValidationPath;

    @ContractProperty(issue.code)
    code: ValidationCode;

    @ContractProperty(issue.params)
    params?: Record<string, string | number | boolean>;
}

export class ContentValidationReportResponse implements ContentValidationReportDto {
    @ApiProperty({ type: [ValidationIssueResponse] })
    issues: ValidationIssueResponse[];

    @ContractProperty(contentValidationReportSchema.shape.isComplete)
    isComplete: boolean;
}
