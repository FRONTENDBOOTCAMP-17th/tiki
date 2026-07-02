import { test, expect } from '@playwright/test';
import path from 'path';

// 2026-07-02 (17차) — 다크모드 전면 도입 + 신규 /info/* 안내 페이지 + SEO 정비 이후 데일리 E2E
const IMG = path.join(__dirname, '../../images/2026-07-02');

test.describe('TiKi Daily E2E - 2026-07-02 (17차)', () => {
  test('S01 home light desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle', timeout: 25000 });
    await page.screenshot({ path: `${IMG}/tiki-s01-home-light.png` });
    const body = await page.textContent('body');
    expect(body!.length).toBeGreaterThan(50);
  });

  test('S02 home dark toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle', timeout: 25000 });
    const toggle = page.locator('[aria-label*="다크"], [aria-label*="테마"], button:has-text("다크")').first();
    if (await toggle.isVisible({ timeout: 4000 }).catch(() => false)) {
      await toggle.click();
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: `${IMG}/tiki-s02-home-dark.png` });
    const cls = await page.locator('html').getAttribute('class');
    console.log('[dark] html class =', cls);
  });

  test('S03 home mobile 390', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle', timeout: 25000 });
    await page.screenshot({ path: `${IMG}/tiki-s03-home-mobile.png`, fullPage: true });
  });

  test('S04 category', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/category', { waitUntil: 'networkidle', timeout: 20000 });
    await page.screenshot({ path: `${IMG}/tiki-s04-category.png` });
  });

  test('S05 search', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/search', { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
    const input = page.locator('input[type="search"], input[placeholder*="검색"]').first();
    if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
      await input.fill('콘서트');
      await input.press('Enter');
      await page.waitForLoadState('networkidle').catch(() => {});
    }
    await page.screenshot({ path: `${IMG}/tiki-s05-search.png` });
  });

  test('S06 event detail (real event from home)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle', timeout: 25000 });
    const card = page.locator('main a[href]').first();
    if (await card.isVisible({ timeout: 4000 }).catch(() => false)) {
      await card.click().catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
    }
    await page.screenshot({ path: `${IMG}/tiki-s06-event-detail.png` });
  });

  test('S07 non-UUID eventId guard (16차 [필수])', async ({ page }) => {
    const resp = await page.goto('/not-a-uuid', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
    console.log('[non-uuid] status =', resp?.status());
    await page.screenshot({ path: `${IMG}/tiki-s07-nonuuid-eventid.png` });
  });

  test('S08 info pages (신규 엔드포인트)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const pages = ['about', 'faq', 'terms', 'privacy', 'contact', 'seller-guide', 'seller-registration', 'settlement'];
    for (const p of pages) {
      const resp = await page.goto(`/info/${p}`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => null);
      console.log(`[info] /info/${p} =`, resp?.status());
      await page.screenshot({ path: `${IMG}/tiki-s08-info-${p}.png` });
    }
  });

  test('S09 info dark mode', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/info/about', { waitUntil: 'networkidle', timeout: 20000 });
    const toggle = page.locator('[aria-label*="다크"], [aria-label*="테마"]').first();
    if (await toggle.isVisible({ timeout: 4000 }).catch(() => false)) {
      await toggle.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: `${IMG}/tiki-s09-info-dark.png`, fullPage: true });
  });

  test('S10 login page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 20000 });
    await page.screenshot({ path: `${IMG}/tiki-s10-login.png` });
  });
});
