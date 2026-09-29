import { Test } from "@nestjs/testing";
import type { I18nContext } from "nestjs-i18n";
import { HealthController } from "./health.controller";

const fakeI18n = { t: (key: string) => key } as unknown as I18nContext;

describe("HealthController", () => {
  it("returns ok", async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [HealthController] }).compile();
    const result = moduleRef.get(HealthController).check(fakeI18n);
    expect(result.status).toBe("ok");
    expect(result.message).toBe("common.health.ok");
  });
});
