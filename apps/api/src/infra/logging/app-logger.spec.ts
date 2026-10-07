import type { ConfigService } from '@nestjs/config';
import { RequestContext } from '@common/context/request-context';
import type { Configuration } from '@config/interfaces/configuration.interface';
import { AppLogger, toLogEntry } from './app-logger';
import type { LogEntry } from './interfaces/log-entry.interface';
import { LogSink } from './log-sink';

class RecordingSink extends LogSink {
    readonly entries: LogEntry[] = [];

    write(entry: LogEntry): void {
        this.entries.push(entry);
    }
}

function loggerWith(persistLevels: Configuration['logging']['persistLevels']) {
    const sink = new RecordingSink();
    const config = {
        get: () => ({ levels: [], persistLevels, retentionDays: 30, json: true }),
    } as unknown as ConfigService<Configuration, true>;
    return { logger: new AppLogger(config, sink), sink };
}

describe('AppLogger', () => {
    it('persists only the configured levels', () => {
        const { logger, sink } = loggerWith(['warn', 'error']);

        logger.debug('noise', 'Test');
        logger.warn('careful', 'Test');

        expect(sink.entries.map(({ level, message }) => ({ level, message }))).toEqual([
            { level: 'warn', message: 'careful' },
        ]);
    });

    it('attaches the current request id and user', () => {
        const { logger, sink } = loggerWith(['log']);

        RequestContext.run({ requestId: 'req-12345678' }, () => {
            RequestContext.assignUser('user-1');
            logger.log('inside a request', 'Test');
        });

        expect(sink.entries[0]).toMatchObject({ requestId: 'req-12345678', uid: 'user-1' });
    });
});

describe('toLogEntry', () => {
    it('reads the context from the last parameter', () => {
        expect(toLogEntry('log', 'started', ['Bootstrap'])).toMatchObject({
            message: 'started',
            context: 'Bootstrap',
        });
    });

    it('separates a stack trace from the context', () => {
        const stack = 'Error: boom\n    at handler (file.ts:1:1)';

        expect(toLogEntry('error', 'failed', [stack, 'Filter'])).toMatchObject({
            stack,
            context: 'Filter',
        });
    });

    it('serializes errors and objects', () => {
        expect(toLogEntry('error', new TypeError('bad'), []).message).toBe('TypeError: bad');
        expect(toLogEntry('log', { count: 2 }, []).message).toBe('{"count":2}');
    });
});
