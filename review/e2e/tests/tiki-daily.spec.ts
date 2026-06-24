import { test, expect } from '@playwright/test';
import path from 'path';

const IMG = path.join(__dirname, '../../images/2026-06-24');

test.describe('TiKi Daily E2E - 2026-06-24', () => {

  test('S01 home-desktop: home renders (not crash)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.screenshot({ path: `${IMG}/tiki-s01-home-desktop.png`, fullPage: false });
    // Should not show error boundary or crash
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(50);
  });

  test('S02 home-mobile: home at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.screenshot({ path: `${IMG}/tiki-s02-home-mobile.png`, fullPage: false });
  });

  test('S03 category: category page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle', timeout: 20000 });
    // Try clicking a category link or navigating directly
    const categoryLink = page.locator('a[href*="categor"]').first();
    if (await categoryLink.isVisible()) {
      await categoryLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/category', { waitUntil: 'networkidle', timeout: 15000 });
    }
    await page.screenshot({ path: `${IMG}/tiki-s03-category.png`, fullPage: false });
  });

  test('S04 search: search for keyword', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/search', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
    });
    // Try to find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"], input[name*="search"], input[name*="q"]').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('콘서트');
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
    }
    await page.screenshot({ path: `${IMG}/tiki-s04-search.png`, fullPage: false });
  });

  test('S05 event-detail: click event or navigate to event', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle', timeout: 20000 });
    // Try to find an event link
    const eventLink = page.locator('a[href*="/event"], a[href*="/events"]').first();
    if (await eventLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      const href = await eventLink.getAttribute('href');
      await page.goto(href!, { waitUntil: 'networkidle', timeout: 15000 });
    } else {
      await page.goto('/events', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    }
    await page.screenshot({ path: `${IMG}/tiki-s05-event-detail.png`, fullPage: false });
  });

  test('S06 login-user: login as usertest', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
      await page.goto('/auth/login', { waitUntil: 'networkidle', timeout: 15000 });
    });
    await page.screenshot({ path: `${IMG}/tiki-s06a-login-page.png` });
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('usertest@tiki.com');
      await passwordInput.fill('Tiki1234!');
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      await page.waitForLoadState('networkidle');
    }
    await page.screenshot({ path: `${IMG}/tiki-s06b-after-login-user.png` });
  });

  test('S07 mypage: navigate to mypage after user login', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // Login first
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
      await page.goto('/auth/login', { waitUntil: 'networkidle', timeout: 15000 });
    });
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('usertest@tiki.com');
      await passwordInput.fill('Tiki1234!');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
    }
    // Navigate to mypage
    await page.goto('/mypage', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
      await page.goto('/my', { waitUntil: 'networkidle', timeout: 15000 });
    });
    await page.screenshot({ path: `${IMG}/tiki-s07-mypage.png`, fullPage: false });
  });

  test('S08 profile-upload: check profile image upload UI', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // Login first
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
      await page.goto('/auth/login', { waitUntil: 'networkidle', timeout: 15000 });
    });
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('usertest@tiki.com');
      await passwordInput.fill('Tiki1234!');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
    }
    // Try mypage/profile
    for (const url of ['/mypage/profile', '/mypage', '/my/profile', '/profile']) {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 12000 }).catch(() => {});
    }
    await page.screenshot({ path: `${IMG}/tiki-s08-profile-upload.png`, fullPage: false });
  });

  test('S09 login-seller: login as sellertest', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
      await page.goto('/auth/login', { waitUntil: 'networkidle', timeout: 15000 });
    });
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('sellertest@tiki.com');
      await passwordInput.fill('Tiki1234!');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
    }
    await page.screenshot({ path: `${IMG}/tiki-s09-login-seller.png` });
  });

  test('S10 seller-dashboard: seller dashboard page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // Login as seller
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
      await page.goto('/auth/login', { waitUntil: 'networkidle', timeout: 15000 });
    });
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('sellertest@tiki.com');
      await passwordInput.fill('Tiki1234!');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
    }
    // Try seller pages
    for (const url of ['/seller', '/seller/dashboard', '/seller/events']) {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 12000 }).catch(() => null);
      if (res && res.ok()) break;
    }
    await page.screenshot({ path: `${IMG}/tiki-s10-seller-dashboard.png`, fullPage: false });
  });

  test('S11 login-admin: login as admin', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
      await page.goto('/auth/login', { waitUntil: 'networkidle', timeout: 15000 });
    });
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('admin@tiki.com');
      await passwordInput.fill('Tiki1234!');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
    }
    await page.screenshot({ path: `${IMG}/tiki-s11a-admin-login.png` });
    // Try admin pages
    for (const url of ['/admin', '/admin/dashboard', '/admin/users']) {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 12000 }).catch(() => null);
      if (res) {
        await page.screenshot({ path: `${IMG}/tiki-s11b-admin-${url.replace(/\//g,'-')}.png`, fullPage: false });
        if (res.ok()) break;
      }
    }
  });

  test('S12 order-attempt: find and screenshot order form', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // Login as user first
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
      await page.goto('/auth/login', { waitUntil: 'networkidle', timeout: 15000 });
    });
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('usertest@tiki.com');
      await passwordInput.fill('Tiki1234!');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
    }
    // Go to home and try to find an event with a buy/reserve button
    await page.goto('/', { waitUntil: 'networkidle', timeout: 20000 });
    const eventLink = page.locator('a[href*="/event"]').first();
    if (await eventLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      const href = await eventLink.getAttribute('href');
      await page.goto(href!, { waitUntil: 'networkidle', timeout: 15000 });
    }
    await page.screenshot({ path: `${IMG}/tiki-s12a-event-page.png`, fullPage: false });
    // Look for order/buy button - screenshot only, don't click submit
    const buyBtn = page.locator('button:has-text("예약"), button:has-text("구매"), button:has-text("주문"), button:has-text("신청")').first();
    if (await buyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await buyBtn.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `${IMG}/tiki-s12b-order-form.png`, fullPage: false });
    }
  });

});
