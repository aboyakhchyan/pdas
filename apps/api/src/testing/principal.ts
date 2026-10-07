import type { Principal } from '@common/interfaces/principal.interface';

export function principalOf(overrides: Partial<Principal> = {}): Principal {
    return {
        uid: 'user-1',
        role: 'user',
        identity: {
            email: null,
            phoneNumber: '+37491123456',
            displayName: null,
            photoUrl: null,
            providers: ['phone'],
        },
        ...overrides,
    };
}
