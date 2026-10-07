import { Global, Module } from '@nestjs/common';
import { FileStorage } from './file-storage';
import { FirebaseFileStorage } from './firebase-file-storage';

@Global()
@Module({
    providers: [{ provide: FileStorage, useClass: FirebaseFileStorage }],
    exports: [FileStorage],
})
export class StorageModule {}
