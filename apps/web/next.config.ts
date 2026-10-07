import path from 'node:path';
import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const monorepoRoot = path.resolve(process.cwd(), '../..');

// Next already loaded this app's own .env and caches it, so the shared root .env needs a forced reload.
loadEnvConfig(monorepoRoot, process.env.NODE_ENV !== 'production', console, true);

const nextConfig: NextConfig = {
    output: 'standalone',
    outputFileTracingRoot: monorepoRoot,
    turbopack: { root: monorepoRoot },
    transpilePackages: ['@pdas/ui', '@pdas/api-client', '@pdas/core', '@pdas/firebase'],
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
