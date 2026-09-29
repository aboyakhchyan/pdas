import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./config/env";
import { I18nConfigModule } from "./infra/i18n/i18n.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    I18nConfigModule,
    HealthModule,
  ],
})
export class AppModule {}
