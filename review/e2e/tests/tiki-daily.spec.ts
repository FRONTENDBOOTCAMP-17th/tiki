import { test, expect, Page } from '@playwright/test';
import path from 'path';

// 2026-07-07 (20차) — 발표 전날. 델타: 공용 입장검증(/checkin) 통합·8자리 입장코드,
// 결제 상태별 안내(404 대체), 좌석 등급 간 변경 허용.
// 일반 사용자 여정 → 판매자 여정(공용 입장검증) 순서로 실행.
const IMG = path.join(__dirname, '../../images/2026-07-07');

const SELLER = { email: 'sellertest@tiki.com', password: 'Tiki1234!' };
const STAFF = { email: 'usertest@tiki.com', password: 'Tiki1234!' };

async function login(page: Page, acc: { email: string; password: string }) {
  await page.goto('/login', { waitUntil: 'networkidle', timeout: 20000 });
  await page.fill('input[name="email"]', acc.email);
  await page.fill('input[name="password"]', acc.password);
  await Promise.all([
    page.waitForLoadState('networkidle').catch(() => {}),
    page.click('button[form="email-auth"]'),
  ]);
  await page.waitForTimeout(1500);
}

async function logout(page: Page) {
  await page.context().clearCookies();
}

test.describe.serial('TiKi Daily E2E - 2026-07-07 (20차)', () => {
  test('S01 home desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const r = await page.goto('/', { waitUntil: 'networkidle', timeout: 25000 });
    console.log('[home] status', r?.status());
    await page.screenshot({ path: `${IMG}/tiki-s01-home-desktop.png` });
    const body = await page.textContent('body');
    expect(body!.length).toBeGreaterThan(50);
  });

  test('S02 home mobile 390', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle', timeout: 25000 });
    await page.screenshot({ path: `${IMG}/tiki-s02-home-mobile.png`, fullPage: true });
  });

  test('S03 category + event detail', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/category', { waitUntil: 'networkidle', timeout: 20000 });
    await page.screenshot({ path: `${IMG}/tiki-s03-category.png` });
    await page.goto('/', { waitUntil: 'networkidle', timeout: 20000 });
    const card = page.locator('main a[href^="/"]').first();
    if (await card.isVisible({ timeout: 4000 }).catch(() => false)) {
      await card.click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
    }
    await page.screenshot({ path: `${IMG}/tiki-s03b-event-detail.png` });
  });

  test('S04 anon guard: /checkin redirects to login', async ({ page }) => {
    await logout(page);
    const r = await page.goto('/checkin', { waitUntil: 'networkidle', timeout: 20000 });
    console.log('[/checkin anon] final url', page.url(), 'status', r?.status());
    await page.screenshot({ path: `${IMG}/tiki-s04-anon-checkin-redirect.png` });
    expect(page.url()).toContain('/login');
  });

  test('S05 seller login -> /checkin select page (내 공연 목록)', async ({ page }) => {
    await login(page, SELLER);
    const r = await page.goto('/checkin', { waitUntil: 'networkidle', timeout: 20000 });
    console.log('[/checkin seller] status', r?.status());
    await page.screenshot({ path: `${IMG}/tiki-s05-checkin-select.png`, fullPage: true });
    const body = await page.textContent('body');
    expect(body).toContain('입장 검증');
  });

  test('S06 seller -> checkin scan page (8자리 코드 입력 UI)', async ({ page }) => {
    await login(page, SELLER);
    await page.goto('/checkin', { waitUntil: 'networkidle', timeout: 20000 });
    const firstEvent = page.locator('a[href^="/checkin/"]').first();
    if (await firstEvent.isVisible({ timeout: 4000 }).catch(() => false)) {
      await firstEvent.click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
    }
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${IMG}/tiki-s06-checkin-scan.png`, fullPage: true });
    console.log('[checkin scan] url', page.url());
  });

  test('S07 seller -> 예매관리(CSV 내보내기 버튼)', async ({ page }) => {
    await login(page, SELLER);
    const r = await page.goto('/seller/ticketManagement', { waitUntil: 'networkidle', timeout: 20000 });
    console.log('[/seller/ticketManagement] status', r?.status());
    await page.screenshot({ path: `${IMG}/tiki-s07-seller-orders.png`, fullPage: true });
  });

  test('S08 payment: 존재하지 않는 주문 -> 안내(404 아님)', async ({ page }) => {
    await login(page, STAFF);
    const r = await page.goto('/payment/00000000-0000-0000-0000-000000000000', {
      waitUntil: 'networkidle',
      timeout: 20000,
    });
    console.log('[payment bogus] status', r?.status());
    await page.screenshot({ path: `${IMG}/tiki-s08-payment-notice.png` });
    const body = await page.textContent('body');
    console.log(
      '[payment bogus] hasNotice=',
      body?.includes('잘못된 주문') || body?.includes('접근할 수 없는'),
    );
  });

  test('S09 sitemap/robots freshness', async ({ page }) => {
    const sm = await page.goto('/sitemap.xml', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('[sitemap] status', sm?.status());
    const smText = await page.content();
    const m = smText.match(/<lastmod>([^<]+)<\/lastmod>/);
    console.log(
      '[sitemap] first lastmod',
      m?.[1],
      'hasDoubleSlash',
      /https?:\/\/[^/]+\/\//.test(smText.replace(/https?:\/\//, '')),
    );
    const rb = await page.goto('/robots.txt', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('[robots] status', rb?.status());
  });
});
