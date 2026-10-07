import { type DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { RequestValidationPipe } from '@common/pipes/request-validation.pipe';
import type { Configuration } from '@config/interfaces/configuration.interface';
import { FirebaseModule } from '@infra/firebase/firebase.module';
import { I18nConfigModule } from '@infra/i18n/i18n.module';
import { ImageModule } from '@infra/image/image.module';
import { LoggingModule } from '@infra/logging/logging.module';
import { StorageModule } from '@infra/storage/storage.module';
import { DocumentsModule } from '@modules/documents/documents.module';
import { HealthModule } from '@modules/health/health.module';
import { IdentityModule } from '@modules/identity/identity.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { TemplatesModule } from '@modules/templates/templates.module';
import { ValidationModule } from '@modules/validation/validation.module';

@Module({})
export class AppModule {
    static forRoot(configuration: Configuration): DynamicModule {
        return {
            module: AppModule,
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    cache: true,
                    ignoreEnvFile: true,
                    skipProcessEnv: true,
                    load: [() => configuration],
                }),
                FirebaseModule,
                LoggingModule,
                StorageModule,
                ImageModule,
                I18nConfigModule,
                HealthModule,
                IdentityModule,
                ValidationModule,
                TemplatesModule,
                DocumentsModule,
                NotificationsModule,
            ],
            providers: [
                { provide: APP_FILTER, useClass: AllExceptionsFilter },
                { provide: APP_PIPE, useClass: RequestValidationPipe },
            ],
        };
    }
}
