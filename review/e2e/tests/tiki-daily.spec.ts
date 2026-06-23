import { test } from "@playwright/test";
import fs from "node:fs";

// TiKi 데일리 E2E (2026-06-23) — 공개 사용자 동선 스모크 + 이벤트 상세(신규) 확인
// 로그인은 별도 계정 셋업 필요. 오늘은 공개 동선 위주.
const DATE = "2026-06-23";
const IMG = `../images/${DATE}`;
const EVENT_ID = "d78c5c3f-0080-46f0-91dd-218eb65b3f0e"; // 멋진 사자의 전시 (status 공개)
test.beforeAll(() => fs.mkdirSync(IMG, { recursive: true }));

async function visit(page: any, path: string, name: string) {
  const r = await page.goto(path, { waitUntil: "domcontentloaded" });
  console.log(`[${path}] HTTP ${r?.status()}`);
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${IMG}/tiki-${name}.png`, fullPage: false });
}

test("공개 동선: 홈→카테고리→이벤트 상세", async ({ page }) => {
  await visit(page, "/", "01-home");
  await visit(page, "/category", "02-category");
  await visit(page, `/${EVENT_ID}`, "03-event-detail");
});
