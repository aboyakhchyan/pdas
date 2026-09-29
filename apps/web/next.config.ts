import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const monorepoRoot = path.resolve(process.cwd(), "../..");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: monorepoRoot,
  turbopack: { root: monorepoRoot },
  transpilePackages: ["@hyework/ui", "@hyework/api-client"],
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
