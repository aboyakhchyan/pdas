import type { ValidationIssue } from '@pdas/core';
import type { RequestIssue } from '../interfaces/request-issue.interface';
import type { ErrorCode } from './error-code';

export abstract class DomainError extends Error {
    abstract readonly code: ErrorCode;
}

export class UnauthenticatedError extends DomainError {
    readonly code = 'unauthenticated';
}

export class AccessDeniedError extends DomainError {
    readonly code = 'accessDenied';
}

export class NotFoundError extends DomainError {
    readonly code = 'notFound';
}

export class ConflictError extends DomainError {
    readonly code = 'conflict';
}

export class UnsupportedMediaTypeError extends DomainError {
    readonly code = 'unsupportedMediaType';
}

export class ContentInvalidError extends DomainError {
    readonly code = 'contentInvalid';

    constructor(readonly issues: ValidationIssue[]) {
        super();
    }
}

export class RequestInvalidError extends DomainError {
    readonly code = 'invalidRequest';

    constructor(readonly issues: RequestIssue[]) {
        super();
    }
}
