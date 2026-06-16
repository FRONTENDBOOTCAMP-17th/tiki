import { test, expect, type Page } from "@playwright/test";

// 리뷰 전용 일일 E2E (2026-06-16)
// 실제 사용자처럼 공개/데모 페이지를 돌며 렌더와 핵심 컴포넌트 동작을 확인한다.
// 패턴:
//  - networkidle 사용 안 함 (Turbopack dev + Supabase 폴링으로 idle 안 옴) → domcontentloaded + 짧은 대기
//  - 500이 나도 abort 하지 않고 캡처 후 status 로깅
//  - 스크린샷은 ../images/2026-06-16/ 에 fullPage 저장

const IMG = "../images/2026-06-16";
const SETTLE = 1500;

async function goto(page: Page, path: string, id: string) {
  const res = await page.goto(path, { waitUntil: "domcontentloaded" });
  const status = res?.status() ?? 0;
  await page.waitForTimeout(SETTLE);
  console.log(`[${id}] GET ${path} -> ${status}`);
  return status;
}

async function shot(page: Page, id: string) {
  await page.screenshot({ path: `${IMG}/tiki-${id}.png`, fullPage: true });
}

test("T1 홈/메인 (desktop + mobile)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await goto(page, "/", "T1-home-desktop");
  await shot(page, "T1-home-desktop");

  await page.setViewportSize({ width: 390, height: 844 });
  await goto(page, "/", "T1-home-mobile");
  await shot(page, "T1-home-mobile");
});

test("T2 /home (비로그인 -> /login 리다이렉트 기대)", async ({ page }) => {
  const status = await goto(page, "/home", "T2-home");
  console.log(`[T2] final URL = ${page.url()} (status ${status})`);
  await shot(page, "T2-home");
});

test("T3 /login 렌더 (OAuth 버튼)", async ({ page }) => {
  await goto(page, "/login", "T3-login");
  const buttons = await page.getByRole("button").allInnerTexts();
  console.log(`[T3] login buttons = ${JSON.stringify(buttons)}`);
  await shot(page, "T3-login");
});

test("T4a /example/modal — 모달 열기", async ({ page }) => {
  await goto(page, "/example/modal", "T4a-modal-list");
  await shot(page, "T4a-modal-list");

  // "확인 모달 열기" 버튼을 눌러 실제로 모달을 띄운다.
  await page.getByRole("button", { name: "확인 모달 열기" }).click();
  await page.waitForTimeout(600);
  // 모달 내용(제목)이 보이는지 확인
  await expect(page.getByText("모달 제목")).toBeVisible();
  await shot(page, "T4a-modal-open");
  console.log("[T4a] 확인 모달 열림 확인");
});

test("T4b /example/toast — 토스트 트리거 + 색 확인", async ({ page }) => {
  await goto(page, "/example/toast", "T4b-toast-list");
  await shot(page, "T4b-toast-list");

  // 정보(info) 토스트 트리거 -> 파란 계열 배경(#E2EEFB) 확인
  await page.getByRole("button", { name: "정보" }).click();
  await page.waitForTimeout(400);
  const infoToast = page.getByText("정보 메시지!");
  await expect(infoToast).toBeVisible();

  // 성공 토스트도 함께 띄워 색 구분을 캡처에 담는다.
  await page.getByRole("button", { name: "성공" }).click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "경고" }).click();
  await page.waitForTimeout(300);

  await shot(page, "T4b-toast-open");

  // 토스트 컨테이너의 배경색을 직접 읽어 깨지지 않았는지(투명/없음 아님) 확인
  const bg = await infoToast
    .locator("xpath=ancestor-or-self::*[contains(@class,'bg-')][1]")
    .evaluate((el) => getComputedStyle(el).backgroundColor)
    .catch(() => "n/a");
  console.log(`[T4b] info toast background = ${bg}`);
});

test("T4c /example/navigation — 렌더", async ({ page }) => {
  await goto(page, "/example/navigation", "T4c-navigation");
  await shot(page, "T4c-navigation");
});

test("T5 /example/filter — 필터 데모 렌더", async ({ page }) => {
  await goto(page, "/example/filter", "T5-filter");
  await shot(page, "T5-filter");
});
