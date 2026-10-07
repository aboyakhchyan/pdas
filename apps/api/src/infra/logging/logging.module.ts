import { Global, Module } from '@nestjs/common';
import { AppLogger } from './app-logger';
import { FirestoreLogSink } from './firestore-log-sink';
import { LogSink } from './log-sink';

@Global()
@Module({
    providers: [AppLogger, { provide: LogSink, useClass: FirestoreLogSink }],
    exports: [AppLogger],
})
export class LoggingModule {}
