import { z } from 'zod';

export const NODE_ENVIRONMENTS = ['development', 'test', 'production'] as const;
export const LOG_LEVELS = ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'] as const;
export const LOG_FORMATS = ['json', 'pretty'] as const;

const logLevelsSchema = (defaults: string) => csv(z.enum(LOG_LEVELS), defaults);

export const envSchema = z.object({
    NODE_ENV: z.enum(NODE_ENVIRONMENTS).default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
    CORS_ORIGINS: csv(z.url(), 'http://localhost:3000,http://localhost:3001').pipe(
        z.array(z.url()).min(1),
    ),
    REDIS_URL: z.url().optional(),
    FIREBASE_PROJECT_ID: z.string().min(1),
    FIREBASE_CLIENT_EMAIL: z.email(),
    FIREBASE_PRIVATE_KEY: z
        .string()
        .transform((key) => key.replace(/\\n/g, '\n'))
        .refine((key) => key.includes('-----BEGIN PRIVATE KEY-----'), {
            message: 'Must be a PEM private key of the Firebase service account',
        }),
    FIREBASE_STORAGE_BUCKET: z.string().min(1),
    LOG_LEVELS: logLevelsSchema('fatal,error,warn,log'),
    LOG_PERSIST_LEVELS: logLevelsSchema('fatal,error,warn,log'),
    LOG_RETENTION_DAYS: z.coerce.number().int().min(1).max(365).default(30),
    LOG_FORMAT: z.enum(LOG_FORMATS).optional(),
    MAIL_FROM: z.string().trim().min(3).max(320).optional(),
    MAIL_REPLY_TO: z.email().optional(),
    MAIL_COLLECTION: z.string().min(1).default('mail'),
    MAIL_TEMPLATES_COLLECTION: z.string().min(1).default('mailTemplates'),
});

function csv<T extends z.ZodType<unknown, string>>(item: T, defaults: string) {
    return z
        .string()
        .default(defaults)
        .transform((value) =>
            value
                .split(',')
                .map((part) => part.trim())
                .filter(Boolean),
        )
        .pipe(z.array(item));
}
