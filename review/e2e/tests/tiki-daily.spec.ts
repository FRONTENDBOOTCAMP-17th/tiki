import { test, expect, Page } from '@playwright/test';
import path from 'path';

// 2026-07-06 (19차) — 판매자 스태프 관리 + 공연별 체크인 도입 이후 데일리 E2E
// 일반 사용자 여정 → 판매자 여정(스태프 초대) → 스태프 여정(수락→체크인) 순서로 실행
const IMG = path.join(__dirname, '../../images/2026-07-06');

const SELLER = { email: 'sellertest@tiki.com', password: 'Tiki1234!' };
const STAFF = { email: 'usertest@tiki.com', password: 'Tiki1234!' };
// sellertest 소유 공연 (staff-state 조회로 확인)
const SELLER_EVENT_TITLE = '이하람 단독 콘서트';
const UNASSIGNED_EVENT_ID = '6be9177b-c6fe-454f-b8e5-5df6c34c2fb2'; // 배정 안 된 다른 공연

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

test.describe.serial('TiKi Daily E2E - 2026-07-06 (19차)', () => {
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

  test('S04 anon guard: /staff redirects to login', async ({ page }) => {
    await logout(page);
    const r = await page.goto('/staff', { waitUntil: 'networkidle', timeout: 20000 });
    console.log('[anon /staff] final url =', page.url(), 'status', r?.status());
    await page.screenshot({ path: `${IMG}/tiki-s04-anon-staff-redirect.png` });
    expect(page.url()).toContain('/login');
  });

  test('S05 seller login + dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await login(page, SELLER);
    console.log('[seller] after login url =', page.url());
    await page.goto('/seller', { waitUntil: 'networkidle', timeout: 20000 });
    await page.screenshot({ path: `${IMG}/tiki-s05-seller-dashboard.png` });
  });

  test('S06 seller ticketManagement (신규 페이지네이션/CSV)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await login(page, SELLER);
    const r = await page.goto('/seller/ticketManagement', { waitUntil: 'networkidle', timeout: 20000 });
    console.log('[ticketManagement] status', r?.status());
    await page.screenshot({ path: `${IMG}/tiki-s06-ticket-management.png`, fullPage: true });
  });

  test('S07 seller staff invite (usertest 초대)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await login(page, SELLER);
    const r = await page.goto('/seller/staff', { waitUntil: 'networkidle', timeout: 20000 });
    console.log('[seller/staff] status', r?.status());
    // 공연 선택 (첫 옵션이 최신순 첫 공연)
    const select = page.locator('select').first();
    if (await select.isVisible({ timeout: 3000 }).catch(() => false)) {
      const opts = await select.locator('option').allTextContents();
      const idx = opts.findIndex((t) => t.includes(SELLER_EVENT_TITLE));
      if (idx >= 0) await select.selectOption({ index: idx });
    }
    await page.fill('input[type="email"]', STAFF.email);
    await page.click('button:has-text("초대")');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${IMG}/tiki-s07-seller-staff-invite.png`, fullPage: true });
    const body = await page.textContent('body');
    console.log('[invite] 초대를 보냈=', body?.includes('초대를 보냈'), ' 이미=', body?.includes('이미 초대'));
  });

  test('S08 staff login + accept invite', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, STAFF);
    console.log('[staff] after login url =', page.url());
    await page.goto('/staff', { waitUntil: 'networkidle', timeout: 20000 });
    await page.screenshot({ path: `${IMG}/tiki-s08-staff-home-pending.png`, fullPage: true });
    const acceptBtn = page.locator('button:has-text("수락")').first();
    if (await acceptBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await acceptBtn.click();
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: `${IMG}/tiki-s08b-staff-home-accepted.png`, fullPage: true });
  });

  test('S09 staff checkin page (배정된 공연)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, STAFF);
    await page.goto('/staff', { waitUntil: 'networkidle', timeout: 20000 });
    const link = page.locator('a[href^="/staff/checkin/"]').first();
    const href = await link.getAttribute('href', { timeout: 4000 }).catch(() => null);
    if (href) {
      await page.goto(href, { waitUntil: 'networkidle', timeout: 20000 });
    }
    console.log('[staff checkin] url =', page.url());
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${IMG}/tiki-s09-staff-checkin.png`, fullPage: true });
    const body = await page.textContent('body');
    console.log('[checkin] QR 스캔 문구=', body?.includes('QR') || body?.includes('스캔'));
  });

  test('S10 staff checkin authz: 배정 안 된 공연은 차단', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, STAFF);
    const r = await page.goto(`/staff/checkin/${UNASSIGNED_EVENT_ID}`, { waitUntil: 'networkidle', timeout: 20000 });
    console.log('[unassigned checkin] status', r?.status(), 'url', page.url());
    await page.screenshot({ path: `${IMG}/tiki-s10-staff-checkin-unassigned.png`, fullPage: true });
    const body = await page.textContent('body');
    console.log('[unassigned] 배정되지 않은=', body?.includes('배정되지 않은'));
    expect(body).toContain('배정되지 않은');
  });
});
