import { ConsoleLogger, Injectable, type LoggerService, type LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestContext } from '@common/context/request-context';
import type { Configuration } from '@config/interfaces/configuration.interface';
import type { LogEntry } from './interfaces/log-entry.interface';
import { LogSink } from './log-sink';

const STACK_TRACE = /\n\s+at .+/;

/**
 * Application-wide logger (installed with `app.useLogger`). Every `new Logger(Context.name)` in
 * the code ends up here: entries go to stdout and, for the configured levels, to the log sink,
 * enriched with the current request id and user.
 */
@Injectable()
export class AppLogger implements LoggerService {
    private readonly console: ConsoleLogger;
    private readonly persistLevels: ReadonlySet<LogLevel>;

    constructor(
        config: ConfigService<Configuration, true>,
        private readonly sink: LogSink,
    ) {
        const { levels, persistLevels, json } = config.get('logging', { infer: true });
        this.console = new ConsoleLogger({ logLevels: levels, json, colors: !json });
        this.persistLevels = new Set(persistLevels);
    }

    log(message: unknown, ...params: unknown[]): void {
        this.console.log(message, ...params);
        this.persist('log', message, params);
    }

    error(message: unknown, ...params: unknown[]): void {
        this.console.error(message, ...params);
        this.persist('error', message, params);
    }

    warn(message: unknown, ...params: unknown[]): void {
        this.console.warn(message, ...params);
        this.persist('warn', message, params);
    }

    debug(message: unknown, ...params: unknown[]): void {
        this.console.debug(message, ...params);
        this.persist('debug', message, params);
    }

    verbose(message: unknown, ...params: unknown[]): void {
        this.console.verbose(message, ...params);
        this.persist('verbose', message, params);
    }

    fatal(message: unknown, ...params: unknown[]): void {
        this.console.fatal(message, ...params);
        this.persist('fatal', message, params);
    }

    private persist(level: LogLevel, message: unknown, params: unknown[]): void {
        if (!this.persistLevels.has(level)) return;
        this.sink.write(toLogEntry(level, message, params));
    }
}

/** Follows Nest's calling convention: `(message, ...extras, context?)`, stacks for errors. */
export function toLogEntry(level: LogLevel, message: unknown, params: unknown[]): LogEntry {
    const last = params.at(-1);
    const context = typeof last === 'string' && params.length > 0 ? last : undefined;
    const extras = context === undefined ? params : params.slice(0, -1);
    const stack =
        extras.find(
            (extra): extra is string => typeof extra === 'string' && STACK_TRACE.test(extra),
        ) ?? (message instanceof Error ? message.stack : undefined);
    const request = RequestContext.current();

    return {
        level,
        message: stringify(message),
        context,
        stack,
        requestId: request?.requestId,
        uid: request?.uid,
        timestamp: new Date(),
    };
}

function stringify(message: unknown): string {
    if (typeof message === 'string') return message;
    if (message instanceof Error) return `${message.name}: ${message.message}`;
    try {
        return JSON.stringify(message);
    } catch {
        return String(message);
    }
}
