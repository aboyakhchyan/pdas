import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
    REQUEST_ID_HEADER,
    requestContextMiddleware,
} from '@common/middleware/request-context.middleware';
import { loadConfiguration } from '@config/configuration';
import { AppLogger } from '@infra/logging/app-logger';

const API_PREFIX = 'v1';
const JSON_BODY_LIMIT = '1mb';
const CORS_MAX_AGE_SECONDS = 3600;

async function bootstrap() {
    const configuration = loadConfiguration();
    const { port, corsOrigins, isProduction } = configuration.app;
    const app = await NestFactory.create<NestExpressApplication>(AppModule.forRoot(configuration), {
        bufferLogs: true,
        bodyParser: false,
        rawBody: true,
    });
    app.useLogger(app.get(AppLogger));

    app.use(requestContextMiddleware);
    app.useBodyParser('json', { limit: JSON_BODY_LIMIT });
    app.setGlobalPrefix(API_PREFIX);
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Authorization',
            'Content-Type',
            'Accept-Language',
            'X-Lang',
            REQUEST_ID_HEADER,
        ],
        exposedHeaders: [REQUEST_ID_HEADER, 'Retry-After'],
        maxAge: CORS_MAX_AGE_SECONDS,
    });
    app.enableShutdownHooks();

    if (!isProduction) {
        const document = SwaggerModule.createDocument(
            app,
            new DocumentBuilder().setTitle('PDAS API').setVersion('1.0').addBearerAuth().build(),
        );
        SwaggerModule.setup('docs', app, document, { jsonDocumentUrl: 'docs/openapi.json' });
    }

    await app.listen(port, '0.0.0.0');
    Logger.log(`Listening on port ${port} under /${API_PREFIX}`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
    new Logger('Bootstrap').fatal(error instanceof Error ? error.message : error);
    process.exit(1);
});
