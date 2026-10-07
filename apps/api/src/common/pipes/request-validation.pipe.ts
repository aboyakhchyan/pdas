import { Injectable, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { RequestInvalidError } from '../errors/domain-error';
import type { RequestIssue } from '../interfaces/request-issue.interface';

/**
 * Global pipe for request DTO classes (body, query, params): transforms plain input into the
 * class, rejects unknown properties and reports every failure as a `RequestInvalidError`.
 */
@Injectable()
export class RequestValidationPipe extends ValidationPipe {
    constructor() {
        super({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
            validationError: { target: false, value: false },
            exceptionFactory: (errors) => new RequestInvalidError(toRequestIssues(errors)),
        });
    }
}

export function toRequestIssues(
    errors: ValidationError[],
    parentPath: (string | number)[] = [],
): RequestIssue[] {
    return errors.flatMap((error) => {
        const path = [...parentPath, error.property];
        const own = Object.values(error.constraints ?? {}).map((message) => ({ path, message }));
        return [...own, ...toRequestIssues(error.children ?? [], path)];
    });
}
