import { Injectable } from '@nestjs/common';
import type { Blueprint, DocumentContent, ValidationIssue } from '@pdas/core';
import { validateContent } from '../../domain/content-validator';
import { parseIsoDate } from '../../domain/dates';
import type { ValidationMode } from '../../domain/interfaces/content-validation.interface';
import type { ContentAssessment } from '../interfaces/content-assessment.interface';

const LEGAL_TIME_ZONE = 'Asia/Yerevan';

@Injectable()
export class ContentValidationService {
    private readonly calendar = new Intl.DateTimeFormat('en-CA', { timeZone: LEGAL_TIME_ZONE });

    validate(
        blueprint: Blueprint,
        content: DocumentContent,
        mode: ValidationMode,
    ): ValidationIssue[] {
        return validateContent(blueprint, content, { mode, today: this.today() });
    }

    assess(blueprint: Blueprint, content: DocumentContent): ContentAssessment {
        const issues = this.validate(blueprint, content, 'draft');
        const isComplete =
            issues.length === 0 && this.validate(blueprint, content, 'complete').length === 0;
        return { issues, isComplete };
    }

    private today(): Date {
        const today = parseIsoDate(this.calendar.format(new Date()));
        if (!today) throw new Error(`Cannot resolve the current date in ${LEGAL_TIME_ZONE}`);
        return today;
    }
}
