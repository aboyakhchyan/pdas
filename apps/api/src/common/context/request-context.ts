import { AsyncLocalStorage } from 'node:async_hooks';
import type { RequestContextStore } from '../interfaces/request-context.interface';

export class RequestContext {
    private static readonly storage = new AsyncLocalStorage<RequestContextStore>();

    static run<T>(store: RequestContextStore, callback: () => T): T {
        return this.storage.run(store, callback);
    }

    static current(): RequestContextStore | undefined {
        return this.storage.getStore();
    }

    static assignUser(uid: string): void {
        const store = this.storage.getStore();
        if (store) store.uid = uid;
    }
}
