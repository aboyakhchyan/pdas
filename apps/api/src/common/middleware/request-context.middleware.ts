import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { RequestContext } from '../context/request-context';

export const REQUEST_ID_HEADER = 'x-request-id';

const TRUSTED_REQUEST_ID = /^[\w.-]{8,128}$/;

/**
 * Opens the request context (request id, later the user) for everything that runs while the
 * request is handled. Installed before the body parsers so even their errors are correlated.
 */
export function requestContextMiddleware(request: Request, response: Response, next: NextFunction) {
    const incoming = request.headers[REQUEST_ID_HEADER];
    const requestId =
        typeof incoming === 'string' && TRUSTED_REQUEST_ID.test(incoming) ? incoming : randomUUID();

    response.setHeader(REQUEST_ID_HEADER, requestId);
    RequestContext.run({ requestId }, next);
}
