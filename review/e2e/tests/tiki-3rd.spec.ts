import { test, expect } from "@playwright/test";

// 3차 리뷰(2026-06-10) — 새 컴포넌트(header/toast/sidebar/toggle/input/notice) 예제 페이지 렌더 확인 +
// 2차 button casing 500이 고쳐졌는지 재확인.
const SHOT = "../images";

// 콘솔/페이지 에러를 수집해 500/런타임 오류를 화면 외에도 잡는다.
function attachErrorCollectors(page: import("@playwright/test").Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
  });
  return errors;
}

test("홈(/) 렌더", async ({ page }) => {
  const res = await page.goto("/");
  console.log("[/] status =", res?.status());
  await page.screenshot({ path: `${SHOT}/3rd-01-home.png`, fullPage: true });
});

test("예제: Header (구매자/판매자/관리자)", async ({ page }) => {
  const errors = attachErrorCollectors(page);
  const res = await page.goto("/example/header");
  console.log("[/example/header] status =", res?.status());
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOT}/3rd-02-header.png`, fullPage: true });
  console.log("[/example/header] errors =", JSON.stringify(errors));
});

test("예제: Toast (성공/에러/경고/정보 클릭)", async ({ page }) => {
  const errors = attachErrorCollectors(page);
  const res = await page.goto("/example/toast");
  console.log("[/example/toast] status =", res?.status());
  await page.screenshot({ path: `${SHOT}/3rd-03-toast-before.png`, fullPage: true });
  // 토스트 버튼이 떴으면 눌러서 토스트가 쌓이는지 본다.
  const success = page.getByRole("button", { name: "성공" });
  if (await success.count()) {
    await success.click();
    await page.getByRole("button", { name: "경고" }).click();
    await page.getByRole("button", { name: "정보" }).click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${SHOT}/3rd-03-toast-after.png`, fullPage: true });
  }
  console.log("[/example/toast] errors =", JSON.stringify(errors));
});

test("예제: Notice", async ({ page }) => {
  const res = await page.goto("/example/notice");
  console.log("[/example/notice] status =", res?.status());
  await page.screenshot({ path: `${SHOT}/3rd-04-notice.png`, fullPage: true });
});

test("[2차 버그 재확인] 예제: Button — casing import 500 고쳐졌나", async ({ page }) => {
  const errors = attachErrorCollectors(page);
  const res = await page.goto("/example/button");
  console.log("[/example/button] status =", res?.status());
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOT}/3rd-05-button.png`, fullPage: true });
  console.log("[/example/button] errors =", JSON.stringify(errors));
});

test("예제: Navigation (모바일 390px) — 회귀 확인", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const res = await page.goto("/example/navigation");
  console.log("[/example/navigation] status =", res?.status());
  await page.screenshot({ path: `${SHOT}/3rd-06-navigation-mobile.png`, fullPage: true });
});
