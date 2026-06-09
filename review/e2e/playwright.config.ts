import { defineConfig, devices } from "@playwright/test";
// 리뷰 전용 E2E. dev 서버(PORT 3102)를 별도로 띄워 둔 상태에서 실행.
export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3102",
    headless: true,
    viewport: { width: 1280, height: 900 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
