import type { ValidationIssue } from '@pdas/core';

export interface ContentAssessment {
    issues: ValidationIssue[];
    isComplete: boolean;
}
