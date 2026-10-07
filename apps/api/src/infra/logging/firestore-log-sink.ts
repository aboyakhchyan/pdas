import { type BeforeApplicationShutdown, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type CollectionReference, Firestore } from 'firebase-admin/firestore';
import type { Configuration } from '@config/interfaces/configuration.interface';
import type { LogEntry } from './interfaces/log-entry.interface';
import { LogSink } from './log-sink';

const FLUSH_INTERVAL_MS = 2_000;
const MAX_BATCH_SIZE = 400;
const MAX_BUFFERED_ENTRIES = 10_000;
const MAX_MESSAGE_LENGTH = 10_000;
const MAX_STACK_LENGTH = 20_000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Buffers log entries and writes them to the `logs` collection in batches, so logging never
 * waits on Firestore. `expiresAt` drives the Firestore TTL policy declared in
 * infrastructure/firebase/firestore.indexes.json.
 */
@Injectable()
export class FirestoreLogSink extends LogSink implements BeforeApplicationShutdown {
    private readonly logs: CollectionReference;
    private readonly retentionMs: number;
    private readonly timer: NodeJS.Timeout;
    private buffer: LogEntry[] = [];
    private dropped = 0;
    private flushing: Promise<void> | undefined;

    constructor(
        private readonly firestore: Firestore,
        config: ConfigService<Configuration, true>,
    ) {
        super();
        this.logs = firestore.collection('logs');
        this.retentionMs = config.get('logging', { infer: true }).retentionDays * DAY_MS;
        this.timer = setInterval(() => void this.flush(), FLUSH_INTERVAL_MS).unref();
    }

    write(entry: LogEntry): void {
        if (this.buffer.length >= MAX_BUFFERED_ENTRIES) {
            this.dropped += 1;
            return;
        }
        this.buffer.push(entry);
        if (this.buffer.length >= MAX_BATCH_SIZE) void this.flush();
    }

    async beforeApplicationShutdown(): Promise<void> {
        clearInterval(this.timer);
        await this.flushing;
        await this.flush();
    }

    private flush(): Promise<void> {
        this.flushing ??= this.drain().finally(() => (this.flushing = undefined));
        return this.flushing;
    }

    private async drain(): Promise<void> {
        while (this.buffer.length > 0) {
            const entries = this.buffer.splice(0, MAX_BATCH_SIZE);
            const batch = this.firestore.batch();
            for (const entry of entries) batch.create(this.logs.doc(), this.toRecord(entry));
            await batch.commit().catch((error: unknown) => reportFailure(entries.length, error));
        }
        if (this.dropped > 0) {
            reportFailure(this.dropped, new Error('log buffer was full'));
            this.dropped = 0;
        }
    }

    private toRecord({ message, stack, timestamp, ...entry }: LogEntry) {
        return {
            ...entry,
            message: message.slice(0, MAX_MESSAGE_LENGTH),
            stack: stack?.slice(0, MAX_STACK_LENGTH),
            timestamp,
            expiresAt: new Date(timestamp.getTime() + this.retentionMs),
        };
    }
}

function reportFailure(count: number, error: unknown): void {
    const reason = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[FirestoreLogSink] lost ${count} log entries: ${reason}\n`);
}
