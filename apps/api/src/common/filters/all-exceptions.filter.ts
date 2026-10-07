import { type ArgumentsHost, Catch, type ExceptionFilter, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { RequestContext } from '../context/request-context';
import type { ResolvedException } from '../interfaces/resolved-exception.interface';
import type { ErrorResponse } from '../responses/error.response';
import { resolveException } from './exception-resolver';

/**
 * The single place that turns any error into an HTTP response. Clients always get the same
 * shape (`ErrorResponse`) with a translated message; internals never leak, 5xx are logged with
 * their stack and correlated by request id.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        if (host.getType() !== 'http') {
            this.logger.error(describe(exception), stackOf(exception));
            return;
        }

        const http = host.switchToHttp();
        const request = http.getRequest<Request>();
        const response = http.getResponse<Response>();
        const resolved = resolveException(exception);
        this.report(exception, resolved, request);

        if (response.headersSent) return;
        if (resolved.retryAfterSeconds) {
            response.setHeader('Retry-After', String(resolved.retryAfterSeconds));
        }
        response.status(resolved.status).json(toBody(resolved, request, host));
    }

    private report(exception: unknown, resolved: ResolvedException, request: Request): void {
        const summary = `${request.method} ${request.originalUrl} → ${resolved.status} ${resolved.code}`;
        if (resolved.status >= 500) {
            this.logger.error(`${summary}: ${describe(exception)}`, stackOf(exception));
        } else {
            this.logger.debug(`${summary}: ${describe(exception)}`);
        }
    }
}

function toBody(resolved: ResolvedException, request: Request, host: ArgumentsHost): ErrorResponse {
    const message = I18nContext.current(host)?.t(`errors.${resolved.code}`) ?? resolved.code;
    return {
        statusCode: resolved.status,
        code: resolved.code,
        message,
        ...(resolved.issues && { issues: resolved.issues as ErrorResponse['issues'] }),
        requestId: RequestContext.current()?.requestId ?? '',
        path: request.originalUrl.split('?', 1)[0] ?? request.path,
        timestamp: new Date().toISOString(),
    };
}

function describe(exception: unknown): string {
    if (!(exception instanceof Error)) return String(exception);
    const name = exception.constructor.name;
    return exception.message ? `${name}: ${exception.message}` : name;
}

function stackOf(exception: unknown): string | undefined {
    return exception instanceof Error ? exception.stack : undefined;
}
