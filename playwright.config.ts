import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3100",
    headless: true,
  },
  webServer: {
    command: "node scripts/reset-next.mjs && next dev -p 3100",
    port: 3100,
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      PORT: "3100",
    },
  },
});
