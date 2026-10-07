import { join } from "node:path";
import { Module } from "@nestjs/common";
import { DEFAULT_LOCALE } from "@pdas/core";
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from "nestjs-i18n";

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: DEFAULT_LOCALE,
      loaderOptions: {
        path: join(__dirname, "..", "..", "i18n"),
        watch: true,
      },
      resolvers: [
        new QueryResolver(["lang"]),
        new HeaderResolver(["x-lang"]),
        AcceptLanguageResolver,
      ],
      logging: false,
    }),
  ],
  exports: [I18nModule],
})
export class I18nConfigModule {}
