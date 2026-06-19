import { defineConfig, devices } from "@playwright/test";
// 리뷰 전용 E2E. dev 서버를 별도 포트로 띄워 둔 상태에서 실행한다(조마다 포트 다름).
// PORT 환경변수로 포트를 맞춘다(기본 3102, 9차 리뷰는 3201).
const PORT = process.env.PORT ?? "3102";
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;
export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    viewport: { width: 1280, height: 900 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `PORT=${PORT} npm run dev`,
    url: BASE_URL,
    cwd: "../../",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
