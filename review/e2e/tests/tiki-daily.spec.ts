import { test, expect, type Page } from "@playwright/test";

// 리뷰 전용 일일 E2E (2026-06-16)
// 실제 사용자처럼 공개/데모 페이지를 돌며 렌더와 핵심 컴포넌트 동작을 확인한다.
// 패턴:
//  - networkidle 사용 안 함 (Turbopack dev + Supabase 폴링으로 idle 안 옴) → domcontentloaded + 짧은 대기
//  - 500이 나도 abort 하지 않고 캡처 후 status 로깅
//  - 스크린샷은 ../images/2026-06-16/ 에 fullPage 저장

const IMG = "../images/2026-06-19";
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

// 이번 회차 신규 라우트: 검색 페이지 + 검색 API + 무한스크롤
test("T6 /search — 검색 페이지 렌더 + 결과/무한스크롤", async ({ page }) => {
  // 데스크톱
  await page.setViewportSize({ width: 1280, height: 900 });
  await goto(page, "/search", "T6-search-desktop");
  await shot(page, "T6-search-desktop");

  // 검색어 입력 후 결과 확인
  const input = page.getByRole("textbox").first();
  if (await input.count()) {
    await input.fill("콘서트");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);
    await shot(page, "T6-search-results");
    // 스크롤 내려 무한스크롤 트리거
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(1500);
    await shot(page, "T6-search-scrolled");
  }

  // 모바일
  await page.setViewportSize({ width: 390, height: 844 });
  await goto(page, "/search", "T6-search-mobile");
  await shot(page, "T6-search-mobile");
});

// 검색 API 직접 호출 (응답 형태/상태)
test("T7 /api/events/search — API 응답", async ({ request }) => {
  const res = await request.get("/api/events/search?q=콘서트&limit=5");
  console.log(`[T7] /api/events/search status = ${res.status()}`);
  const body = await res.text();
  console.log(`[T7] body(head) = ${body.slice(0, 300)}`);
});

/* ===== 이번 회차(8차) 신규 엔드포인트 — 사용자 여정 ===== */

// 이벤트 상세(신규, 395줄). API(/api/events/[id])가 아직 없어 mock 폴백으로 렌더되는지 확인.
test("T8 /[eventId] — 상세 페이지 렌더(mock 폴백)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const status = await goto(page, "/1", "T8-eventDetail-desktop");
  await shot(page, "T8-eventDetail-desktop");
  expect(status).toBeLessThan(500);
  await page.setViewportSize({ width: 390, height: 844 });
  await goto(page, "/1", "T8-eventDetail-mobile");
  await shot(page, "T8-eventDetail-mobile");
});

// 회원가입 폼(신규) — 렌더 + 잘못된 입력 검증 동작
test("T9 /join — 회원가입 폼 렌더", async ({ page }) => {
  const status = await goto(page, "/join", "T9-join");
  await shot(page, "T9-join");
  expect(status).toBeLessThan(500);
});

// 로그인(신규 갱신) — 폼 렌더
test("T10 /login — 로그인 폼", async ({ page }) => {
  await goto(page, "/login", "T10-login");
  await shot(page, "T10-login");
});

// 마이페이지 인증 가드 — 비로그인 시 리다이렉트
test("T11 /mypage(/profile) — 비로그인 인증 가드", async ({ page }) => {
  const status = await goto(page, "/mypage", "T11-mypage-guard");
  await shot(page, "T11-mypage-guard");
  console.log(`[T11] final url = ${page.url()}`);
});

// 회원가입 API 입력 검증 — 잘못된 입력에 fail 응답이 오는지(쓰기 없음, 검증만)
test("T12 /api/auth/join — 입력 검증(빈 값)", async ({ request }) => {
  const res = await request.post("/api/auth/join", { data: {} });
  console.log(`[T12] empty body status = ${res.status()} body = ${(await res.text()).slice(0, 200)}`);
});

/* ===== 판매자(seller) 여정 ===== */

// 판매자 스토어 정보(신규, 실제 supabase 연동) + 나머지 seller 페이지는 스텁
test("T20 /seller/storeInfo — 스토어 정보 페이지", async ({ page }) => {
  const status = await goto(page, "/seller/storeInfo", "T20-seller-storeInfo");
  await shot(page, "T20-seller-storeInfo");
  console.log(`[T20] status = ${status}, url = ${page.url()}`);
});

test("T21 /seller/dashboard — (현재 스텁 확인)", async ({ page }) => {
  const status = await goto(page, "/seller/dashboard", "T21-seller-dashboard");
  await shot(page, "T21-seller-dashboard");
  // 비로그인 → /login 리다이렉트(미들웨어 가드) 기대
  console.log(`[T21] final url = ${page.url()} (status ${status})`);
});

/* ===== 9차 신규 엔드포인트 ===== */

// 판매자 가드(미들웨어) — 비로그인은 /seller/* 전부 /login 으로 막혀야 함
test("T22 /seller/* 가드 — 비로그인 리다이렉트(미들웨어)", async ({ page }) => {
  for (const path of [
    "/seller/storeInfo",
    "/seller/list",
    "/seller/registration",
    "/seller/settlement",
    "/seller/ticketManagement",
  ]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    console.log(`[T22] ${path} -> final url ${page.url()}`);
  }
  await shot(page, "T22-seller-guard");
});

// 마이페이지 신규 페이지(친구/라이브러리/예매내역) — 비로그인 접근 가드 점검
test("T23 /mypage/friends — 친구 관리(신규)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await goto(page, "/mypage/friends", "T23-mypage-friends");
  await shot(page, "T23-mypage-friends");
  console.log(`[T23] final url = ${page.url()}`);
});

test("T24 /mypage/settings — 설정(약관/탈퇴/비번)", async ({ page }) => {
  await goto(page, "/mypage/settings", "T24-mypage-settings");
  await shot(page, "T24-mypage-settings");
});

test("T25 /mypage/library, /mypage/reservations — 신규 라우트", async ({ page }) => {
  await goto(page, "/mypage/library", "T25-mypage-library");
  await shot(page, "T25-mypage-library");
  await goto(page, "/mypage/reservations", "T25-mypage-reservations");
  await shot(page, "T25-mypage-reservations");
});

// API 에러 노출 점검 — 잘못된 eventId(비-uuid)는 원문 DB 에러를 흘리면 안 됨
test("T26 /api/events/[id] — 잘못된 id 에러 응답 확인", async ({ request }) => {
  const bad = await request.get("/api/events/1");
  console.log(`[T26] /api/events/1 status=${bad.status()} body=${(await bad.text()).slice(0, 200)}`);
  const notFound = await request.get(
    "/api/events/00000000-0000-0000-0000-000000000000",
  );
  console.log(`[T26] valid-uuid status=${notFound.status()} body=${(await notFound.text()).slice(0, 200)}`);
});

// 주문 API — 비로그인 401 (쓰기 없음, 인증 가드만 확인)
test("T27 /api/orders — 비로그인 401", async ({ request }) => {
  const res = await request.post("/api/orders", {
    data: { eventId: "x", slotId: "y", ticketGradeId: "z", quantity: 1 },
  });
  console.log(`[T27] /api/orders status=${res.status()} body=${(await res.text()).slice(0, 200)}`);
});
