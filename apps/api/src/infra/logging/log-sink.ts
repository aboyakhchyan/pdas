import type { LogEntry } from './interfaces/log-entry.interface';

/** Durable destination for log entries. Must never throw and never log through Nest. */
export abstract class LogSink {
    abstract write(entry: LogEntry): void;
}
