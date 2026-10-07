import type { LogLevel } from '@nestjs/common';

export interface LogEntry {
    level: LogLevel;
    message: string;
    context?: string;
    stack?: string;
    requestId?: string;
    uid?: string;
    timestamp: Date;
}
