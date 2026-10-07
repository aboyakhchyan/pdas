export const ERROR_CODES = [
    'invalidRequest',
    'malformedBody',
    'unauthenticated',
    'accessDenied',
    'notFound',
    'conflict',
    'payloadTooLarge',
    'unsupportedMediaType',
    'contentInvalid',
    'tooManyRequests',
    'internal',
    'serviceUnavailable',
    'timeout',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];
