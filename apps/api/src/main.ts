import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import type { Env } from "./config/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.setGlobalPrefix("v1");
  app.enableCors({
    origin: config.get("CORS_ORIGINS", { infer: true }).split(","),
    credentials: true,
  });
  app.enableShutdownHooks();

  if (config.get("NODE_ENV", { infer: true }) !== "production") {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle("PDAS API").setVersion("1.0").addBearerAuth().build(),
    );
    SwaggerModule.setup("docs", app, document, { jsonDocumentUrl: "docs/openapi.json" });
  }

  await app.listen(config.get("PORT", { infer: true }), "0.0.0.0");
}

void bootstrap();
