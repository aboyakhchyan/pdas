import { Global, Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type App, cert, deleteApp, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import type { Configuration } from '@config/interfaces/configuration.interface';

const FIREBASE_APP = Symbol('FirebaseApp');

@Global()
@Module({
    providers: [
        {
            provide: FIREBASE_APP,
            inject: [ConfigService],
            useFactory: (config: ConfigService<Configuration, true>): App => {
                const { projectId, clientEmail, privateKey, storageBucket } = config.get(
                    'firebase',
                    {
                        infer: true,
                    },
                );
                return initializeApp({
                    projectId,
                    storageBucket,
                    credential: cert({ projectId, clientEmail, privateKey }),
                });
            },
        },
        {
            provide: Firestore,
            inject: [FIREBASE_APP],
            useFactory: (app: App) => {
                const firestore = getFirestore(app);
                firestore.settings({ ignoreUndefinedProperties: true });
                return firestore;
            },
        },
        { provide: Auth, inject: [FIREBASE_APP], useFactory: (app: App) => getAuth(app) },
        { provide: Storage, inject: [FIREBASE_APP], useFactory: (app: App) => getStorage(app) },
    ],
    exports: [Firestore, Auth, Storage],
})
export class FirebaseModule implements OnApplicationShutdown {
    constructor(@Inject(FIREBASE_APP) private readonly app: App) {}

    async onApplicationShutdown() {
        await deleteApp(this.app);
    }
}
