import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3100",
    headless: true,
  },
  webServer: {
    command: "pnpm build && pnpm start",
    port: 3100,
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      PORT: "3100",
    },
  },
});
