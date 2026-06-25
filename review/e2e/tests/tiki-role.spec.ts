import { test, Page } from "@playwright/test";
import fs from "node:fs";

// 리뷰 전용 역할별 E2E (2026-06-25) — 구매자 공개 동선 + 역할 가드 + 판매자 가입버튼 노출
// ⚠️ 로그인 후(구매자/판매자) 여정은 계정 시드가 인프라로 막혀 실측 불가:
//    - GoTrue Admin 계정생성 HTTP 500 (auth 트리거 추정)
//    - service_role 의 public.users SELECT/UPDATE 가 42501 permission denied (grant 회수)
// 따라서 여기서는 비로그인으로 가능한 범위(공개 페이지 + 가드 + 가입 폼)를 캡처한다.

const DATE = "2026-06-25";
const IMG = `../images/${DATE}`;
const EVENT_ID = "54dbba2a-828c-42d0-b193-6dae6ca39f1b"; // 홈에서 추출한 이벤트 상세 id

test.beforeAll(() => fs.mkdirSync(IMG, { recursive: true }));

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${IMG}/tiki-${name}.png`, fullPage: false });
}

// ── [구매자] 공개 동선 ──────────────────────────────────────────────
test("TB1: 홈 메인", async ({ page }) => {
  const r = await page.goto("/", { waitUntil: "domcontentloaded" });
  console.log("[TB1] home status:", r?.status());
  await page.waitForTimeout(1500);
  await shot(page, "tb1-home");
});

test("TB1b: 검색/랭킹/오픈예정", async ({ page }) => {
  for (const [p, n] of [["/search", "search"], ["/ranking", "ranking"], ["/open", "open"]] as const) {
    const r = await page.goto(p, { waitUntil: "domcontentloaded" });
    console.log(`[TB1b] ${p} status:`, r?.status());
    await page.waitForTimeout(1000);
    await shot(page, `tb1b-${n}`);
  }
});

test("TB1c: 이벤트 상세", async ({ page }) => {
  const r = await page.goto(`/${EVENT_ID}`, { waitUntil: "domcontentloaded" });
  console.log("[TB1c] event detail status:", r?.status());
  await page.waitForTimeout(1500);
  await shot(page, "tb1c-event-detail");
});

// ── [구매자] 가입/로그인 ────────────────────────────────────────────
test("TB2: 회원가입 폼 — 데스크톱(판매자 버튼 노출)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/join", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const sellerBtn = await page.getByText(/판매자/).count();
  console.log("[TB2] 데스크톱 '판매자' 버튼 노출 개수:", sellerBtn);
  await shot(page, "tb2-join-desktop");
});

test("TS1: 회원가입 폼 — 모바일(판매자 버튼 미노출 확인)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/join", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const sellerBtn = await page.getByText(/판매자/).count();
  console.log("[TS1] 모바일 '판매자' 버튼 노출 개수(0 기대):", sellerBtn);
  await shot(page, "ts1-join-mobile");
});

test("TB-login: 로그인 폼", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await shot(page, "login");
});

// ── 역할 가드 (비로그인 → /login) ──────────────────────────────────
test("GUARD: 마이페이지 가드", async ({ page }) => {
  await page.goto("/mypage/profile", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  console.log("[GUARD] /mypage/profile → 최종 URL:", page.url());
  await shot(page, "guard-mypage");
});

test("GUARD: 판매자 영역 가드", async ({ page }) => {
  for (const p of ["/seller", "/seller/registration", "/seller/settlement"]) {
    await page.goto(p, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    console.log(`[GUARD] ${p} → 최종 URL:`, page.url());
  }
  await shot(page, "guard-seller");
});
