import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3120";
const SHOT = "../images/2026-07-01";

const USER = { email: "usertest@tiki.com", password: "Tiki1234!" };
const ADMIN = { email: "admin@tiki.com", password: "Tiki1234!" };

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 15000 }).catch(() => {}),
    page.getByRole("button", { name: /로그인/ }).last().click(),
  ]);
  await page.waitForTimeout(1500);
}

test.describe("TiKi 16th capture", () => {
  test("public: home / category / category detail / support", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${SHOT}/tiki-home.png`, fullPage: false });

    await page.goto(`${BASE}/category`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${SHOT}/tiki-category.png`, fullPage: true });

    await page.goto(`${BASE}/category/concert`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SHOT}/tiki-category-detail.png`, fullPage: false });

    await page.goto(`${BASE}/support`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${SHOT}/tiki-support.png`, fullPage: true });
  });

  test("bad-uuid event detail returns 500 (regression probe)", async ({ page }) => {
    const resp = await page.goto(`${BASE}/not-a-uuid-slug`, { waitUntil: "domcontentloaded" });
    const status = resp?.status();
    await page.screenshot({ path: `${SHOT}/tiki-bad-uuid.png`, fullPage: false });
    console.log("bad-uuid status:", status);
    expect([500, 404]).toContain(status);
  });

  test("valid-uuid missing event renders graceful message", async ({ page }) => {
    await page.goto(`${BASE}/00000000-0000-0000-0000-000000000000`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${SHOT}/tiki-missing-event.png`, fullPage: false });
    await expect(page.getByText("존재하지 않는 공연입니다")).toBeVisible();
  });

  test("user: login + profile dropdown + inquiries", async ({ page }) => {
    await login(page, USER.email, USER.password);
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    // open profile dropdown
    const trigger = page.getByRole("button", { name: "내 메뉴" });
    if (await trigger.count()) {
      await trigger.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SHOT}/tiki-profile-menu.png`, fullPage: false });
    }
    await page.goto(`${BASE}/mypage/inquiries`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${SHOT}/tiki-inquiries.png`, fullPage: true });
  });

  test("admin: notifications manager", async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto(`${BASE}/admin/notifications`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SHOT}/tiki-admin-notifications.png`, fullPage: true });
  });
});
