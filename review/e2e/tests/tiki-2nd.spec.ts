import { test, expect } from "@playwright/test";

// 2차 리뷰(2026-06-09) — 디자인 시스템 컴포넌트/예제 문서 페이지 확인.
const SHOT = "../images";

test("홈(/) 렌더 — Navigation/Footer", async ({ page }) => {
  await page.goto("/");
  await page.screenshot({ path: `${SHOT}/2nd-01-home.png`, fullPage: true });
});

test("예제: Navigation", async ({ page }) => {
  await page.goto("/example/navigation");
  await page.screenshot({ path: `${SHOT}/2nd-02-navigation.png`, fullPage: true });
});

test("예제: Spinner", async ({ page }) => {
  await page.goto("/example/spinner");
  await page.screenshot({ path: `${SHOT}/2nd-03-spinner.png`, fullPage: true });
});

test("[빌드 버그] 예제: Button — casing import 오류로 500", async ({ page }) => {
  const res = await page.goto("/example/button");
  console.log("[/example/button] status =", res?.status());
  await page.screenshot({ path: `${SHOT}/2nd-04-button-500.png` });
});
