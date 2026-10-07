import { HttpException, HttpStatus } from '@nestjs/common';
import type { ErrorCode } from '../errors/error-code';
import {
    AccessDeniedError,
    ConflictError,
    ContentInvalidError,
    DomainError,
    NotFoundError,
    RequestInvalidError,
    UnauthenticatedError,
    UnsupportedMediaTypeError,
} from '../errors/domain-error';
import type { ResolvedException } from '../interfaces/resolved-exception.interface';

type DomainErrorClass = abstract new (...args: never[]) => DomainError;

const STATUS_BY_DOMAIN_ERROR = new Map<DomainErrorClass, HttpStatus>([
    [RequestInvalidError, HttpStatus.BAD_REQUEST],
    [UnauthenticatedError, HttpStatus.UNAUTHORIZED],
    [AccessDeniedError, HttpStatus.FORBIDDEN],
    [NotFoundError, HttpStatus.NOT_FOUND],
    [ConflictError, HttpStatus.CONFLICT],
    [UnsupportedMediaTypeError, HttpStatus.UNSUPPORTED_MEDIA_TYPE],
    [ContentInvalidError, HttpStatus.UNPROCESSABLE_ENTITY],
]);

const CODE_BY_STATUS = new Map<number, ErrorCode>([
    [HttpStatus.BAD_REQUEST, 'invalidRequest'],
    [HttpStatus.UNAUTHORIZED, 'unauthenticated'],
    [HttpStatus.FORBIDDEN, 'accessDenied'],
    [HttpStatus.NOT_FOUND, 'notFound'],
    [HttpStatus.METHOD_NOT_ALLOWED, 'notFound'],
    [HttpStatus.CONFLICT, 'conflict'],
    [HttpStatus.PAYLOAD_TOO_LARGE, 'payloadTooLarge'],
    [HttpStatus.UNSUPPORTED_MEDIA_TYPE, 'unsupportedMediaType'],
    [HttpStatus.UNPROCESSABLE_ENTITY, 'invalidRequest'],
    [HttpStatus.TOO_MANY_REQUESTS, 'tooManyRequests'],
    [HttpStatus.SERVICE_UNAVAILABLE, 'serviceUnavailable'],
    [HttpStatus.GATEWAY_TIMEOUT, 'timeout'],
]);

/** Invalid JSON never gets here: Nest turns it into a `BadRequestException` first. */
const BODY_PARSER_ERRORS: Readonly<Record<string, ResolvedException>> = {
    'entity.verify.failed': { status: HttpStatus.BAD_REQUEST, code: 'malformedBody' },
    'request.aborted': { status: HttpStatus.BAD_REQUEST, code: 'malformedBody' },
    'request.size.invalid': { status: HttpStatus.BAD_REQUEST, code: 'malformedBody' },
    'entity.too.large': { status: HttpStatus.PAYLOAD_TOO_LARGE, code: 'payloadTooLarge' },
    'parameters.too.many': { status: HttpStatus.PAYLOAD_TOO_LARGE, code: 'payloadTooLarge' },
    'encoding.unsupported': {
        status: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        code: 'unsupportedMediaType',
    },
    'charset.unsupported': {
        status: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        code: 'unsupportedMediaType',
    },
};

const RETRY_AFTER_SECONDS = 5;

/** gRPC status codes returned by Firestore (google-gax), see grpc/status.proto. */
const GRPC = {
    deadlineExceeded: 4,
    notFound: 5,
    alreadyExists: 6,
    resourceExhausted: 8,
    aborted: 10,
    unavailable: 14,
} as const;

const internal: ResolvedException = { status: HttpStatus.INTERNAL_SERVER_ERROR, code: 'internal' };

/**
 * Maps anything thrown while handling a request to an HTTP status and a stable error code.
 * Order matters: our own errors first, then framework errors, then SDK errors by shape.
 */
export function resolveException(exception: unknown): ResolvedException {
    if (exception instanceof DomainError) return fromDomainError(exception);
    if (exception instanceof HttpException) return fromHttpException(exception);
    return (
        fromBodyParserError(exception) ??
        fromGrpcError(exception) ??
        fromUpstreamHttpError(exception) ??
        internal
    );
}

function fromDomainError(error: DomainError): ResolvedException {
    const status =
        STATUS_BY_DOMAIN_ERROR.get(error.constructor as DomainErrorClass) ??
        HttpStatus.INTERNAL_SERVER_ERROR;
    const issues = 'issues' in error && Array.isArray(error.issues) ? error.issues : undefined;
    return { status, code: error.code, issues };
}

function fromHttpException(exception: HttpException): ResolvedException {
    const status = exception.getStatus();
    const code = CODE_BY_STATUS.get(status) ?? (status < 500 ? 'invalidRequest' : 'internal');
    const issues =
        status === HttpStatus.BAD_REQUEST ? [{ path: [], message: exception.message }] : undefined;
    return { status, code, issues, ...retryHint(status) };
}

function fromBodyParserError(exception: unknown): ResolvedException | undefined {
    const type = property(exception, 'type');
    return typeof type === 'string' ? BODY_PARSER_ERRORS[type] : undefined;
}

function fromGrpcError(exception: unknown): ResolvedException | undefined {
    const code = property(exception, 'code');
    if (typeof code !== 'number' || property(exception, 'metadata') === undefined) return;

    switch (code) {
        case GRPC.notFound:
            return { status: HttpStatus.NOT_FOUND, code: 'notFound' };
        case GRPC.alreadyExists:
        case GRPC.aborted:
            return { status: HttpStatus.CONFLICT, code: 'conflict' };
        case GRPC.deadlineExceeded:
            return { status: HttpStatus.GATEWAY_TIMEOUT, code: 'timeout' };
        case GRPC.resourceExhausted:
        case GRPC.unavailable:
            return unavailable();
        default:
            return internal;
    }
}

function fromUpstreamHttpError(exception: unknown): ResolvedException | undefined {
    const code = property(exception, 'code');
    if (typeof code !== 'number' || !Array.isArray(property(exception, 'errors'))) return;

    if (code === HttpStatus.NOT_FOUND) return { status: HttpStatus.NOT_FOUND, code: 'notFound' };
    if (code === HttpStatus.TOO_MANY_REQUESTS || code >= 500) return unavailable();
    return internal;
}

function unavailable(): ResolvedException {
    return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        code: 'serviceUnavailable',
        retryAfterSeconds: RETRY_AFTER_SECONDS,
    };
}

function retryHint(status: number): Pick<ResolvedException, 'retryAfterSeconds'> {
    return status === HttpStatus.SERVICE_UNAVAILABLE || status === HttpStatus.TOO_MANY_REQUESTS
        ? { retryAfterSeconds: RETRY_AFTER_SECONDS }
        : {};
}

function property(value: unknown, key: string): unknown {
    return typeof value === 'object' && value !== null && key in value
        ? (value as Record<string, unknown>)[key]
        : undefined;
}
