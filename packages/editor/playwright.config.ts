import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL:
      process.env.VIDRO_PREVIEW === '1'
        ? 'http://127.0.0.1:4184'
        : 'http://127.0.0.1:4183',
    browserName: 'chromium',
    launchOptions: process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : undefined,
  },
  webServer: {
    command:
      process.env.VIDRO_PREVIEW === '1'
        ? 'pnpm exec vite build --config tests/vite.config.ts && pnpm exec vite preview --config tests/vite.config.ts --host 127.0.0.1'
        : 'pnpm exec vite --config tests/vite.config.ts --host 127.0.0.1',
    url:
      process.env.VIDRO_PREVIEW === '1'
        ? 'http://127.0.0.1:4184'
        : 'http://127.0.0.1:4183',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
