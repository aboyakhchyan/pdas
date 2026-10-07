import { existsSync } from 'node:fs';
import { z } from 'zod';
import { envSchema } from './env.schema';
import type { Configuration, Env } from './interfaces/configuration.interface';

export class InvalidEnvironmentError extends Error {
    override readonly name = 'InvalidEnvironmentError';
}

export function loadConfiguration(envFile = '.env'): Configuration {
    if (existsSync(envFile)) process.loadEnvFile(envFile);

    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        throw new InvalidEnvironmentError(
            `Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
        );
    }
    return toConfiguration(parsed.data);
}

function toConfiguration(env: Env): Configuration {
    const isProduction = env.NODE_ENV === 'production';
    return {
        app: {
            nodeEnv: env.NODE_ENV,
            isProduction,
            port: env.PORT,
            corsOrigins: env.CORS_ORIGINS,
        },
        firebase: {
            projectId: env.FIREBASE_PROJECT_ID,
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey: env.FIREBASE_PRIVATE_KEY,
            storageBucket: env.FIREBASE_STORAGE_BUCKET,
        },
        redis: {
            url: env.REDIS_URL,
        },
        logging: {
            levels: env.LOG_LEVELS,
            persistLevels: env.LOG_PERSIST_LEVELS,
            retentionDays: env.LOG_RETENTION_DAYS,
            json: env.LOG_FORMAT ? env.LOG_FORMAT === 'json' : isProduction,
        },
        mail: {
            from: env.MAIL_FROM,
            replyTo: env.MAIL_REPLY_TO,
            collection: env.MAIL_COLLECTION,
            templatesCollection: env.MAIL_TEMPLATES_COLLECTION,
        },
    };
}
