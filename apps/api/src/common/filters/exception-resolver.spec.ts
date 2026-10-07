import { BadRequestException, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import {
    ConflictError,
    ContentInvalidError,
    NotFoundError,
    RequestInvalidError,
    UnsupportedMediaTypeError,
} from '../errors/domain-error';
import { resolveException } from './exception-resolver';

function grpcError(code: number) {
    return Object.assign(new Error('grpc'), { code, details: 'details', metadata: {} });
}

describe('resolveException', () => {
    it.each([
        [new NotFoundError(), 404, 'notFound'],
        [new ConflictError(), 409, 'conflict'],
        [new UnsupportedMediaTypeError(), 415, 'unsupportedMediaType'],
        [new ContentInvalidError([]), 422, 'contentInvalid'],
    ])('maps domain error %p to %i %s', (error, status, code) => {
        expect(resolveException(error)).toMatchObject({ status, code });
    });

    it('keeps the issues of request validation errors', () => {
        const issues = [{ path: ['title'], message: 'Too long' }];

        expect(resolveException(new RequestInvalidError(issues))).toEqual({
            status: 400,
            code: 'invalidRequest',
            issues,
        });
    });

    it('maps framework HTTP exceptions by status', () => {
        expect(resolveException(new NotFoundException())).toMatchObject({
            status: 404,
            code: 'notFound',
        });
        expect(resolveException(new PayloadTooLargeException())).toMatchObject({
            status: 413,
            code: 'payloadTooLarge',
        });
        expect(resolveException(new BadRequestException('Unexpected field'))).toMatchObject({
            status: 400,
            issues: [{ path: [], message: 'Unexpected field' }],
        });
    });

    it.each([
        ['request.aborted', 400, 'malformedBody'],
        ['entity.too.large', 413, 'payloadTooLarge'],
        ['encoding.unsupported', 415, 'unsupportedMediaType'],
    ])('maps body parser error %s to %i %s', (type, status, code) => {
        expect(resolveException(Object.assign(new Error(), { type }))).toMatchObject({
            status,
            code,
        });
    });

    it.each([
        [5, 404, 'notFound'],
        [6, 409, 'conflict'],
        [10, 409, 'conflict'],
        [4, 504, 'timeout'],
        [14, 503, 'serviceUnavailable'],
        [9, 500, 'internal'],
    ])('maps Firestore gRPC code %i to %i %s', (grpcCode, status, code) => {
        expect(resolveException(grpcError(grpcCode))).toMatchObject({ status, code });
    });

    it('asks clients to retry when a backend is unavailable', () => {
        expect(resolveException(grpcError(14)).retryAfterSeconds).toBeGreaterThan(0);
    });

    it('maps Cloud Storage HTTP errors', () => {
        const storageError = (code: number) => Object.assign(new Error(), { code, errors: [] });

        expect(resolveException(storageError(404))).toMatchObject({ status: 404 });
        expect(resolveException(storageError(503))).toMatchObject({ status: 503 });
        expect(resolveException(storageError(403))).toMatchObject({ status: 500 });
    });

    it('hides anything unknown behind a generic internal error', () => {
        expect(resolveException(new TypeError('secret detail'))).toEqual({
            status: 500,
            code: 'internal',
        });
        expect(resolveException('thrown string')).toMatchObject({ status: 500 });
    });
});
