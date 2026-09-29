import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { I18n, type I18nContext } from "nestjs-i18n";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  check(@I18n() i18n: I18nContext) {
    return {
      status: "ok" as const,
      message: i18n.t("common.health.ok"),
      uptime: process.uptime(),
    };
  }
}
