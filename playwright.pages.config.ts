import { defineConfig } from '@playwright/test';
import config from './playwright.config';
import { validateBaseUrl } from './src/lib/site-path';

const baseUrl = validateBaseUrl(process.env.SITE_BASE_URL ?? '/');

export default defineConfig({
  ...config,
  testDir: 'tests/pages',
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        ...config.webServer,
        command: `SITE_BASE_URL=${baseUrl} pnpm serve`,
        port: 4173,
      },
  use: {
    ...config.use,
    baseURL: new URL(
      baseUrl,
      process.env.E2E_BASE_URL ?? 'http://localhost:4173',
    ).href,
  },
});
