import type { LogLevel } from '@nestjs/common';
import type { z } from 'zod';
import type { envSchema, NODE_ENVIRONMENTS } from '../env.schema';

export type Env = z.infer<typeof envSchema>;

export type NodeEnvironment = (typeof NODE_ENVIRONMENTS)[number];

export interface AppConfig {
    nodeEnv: NodeEnvironment;
    isProduction: boolean;
    port: number;
    corsOrigins: string[];
}

export interface FirebaseConfig {
    projectId: string;
    clientEmail: string;
    privateKey: string;
    storageBucket: string;
}

export interface RedisConfig {
    url: string | undefined;
}

export interface LoggingConfig {
    levels: LogLevel[];
    persistLevels: LogLevel[];
    retentionDays: number;
    json: boolean;
}

export interface MailConfig {
    from: string | undefined;
    replyTo: string | undefined;
    collection: string;
    templatesCollection: string;
}

export interface Configuration {
    app: AppConfig;
    firebase: FirebaseConfig;
    redis: RedisConfig;
    logging: LoggingConfig;
    mail: MailConfig;
}
