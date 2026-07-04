import { expect, test } from "@playwright/test";

test.describe("public routes", () => {
  const eventPathPattern =
    /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  test("홈이 열리고 주요 섹션이 렌더된다", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("link", { name: "TiKi" })).toBeVisible();
    await expect(page.getByText("예매 랭킹")).toBeVisible();
  });

  test("공개 목록 페이지들이 200으로 열린다", async ({ request }) => {
    for (const path of ["/category", "/search", "/ranking"]) {
      const response = await request.get(path);
      expect(response.status(), path).toBeLessThan(400);
    }
  });

  test("안내 페이지들이 200으로 열린다", async ({ request }) => {
    for (const path of ["/info/terms", "/info/privacy"]) {
      const response = await request.get(path);
      expect(response.status(), path).toBeLessThan(400);
    }
  });

  test("UUID 형식이 아닌 상세 경로는 500으로 터지지 않는다", async ({
    request,
  }) => {
    const response = await request.get("/not-a-uuid");

    expect(response.status()).not.toBe(500);
  });

  test("비로그인 판매자 페이지 접근은 로그인으로 이동한다", async ({
    page,
  }) => {
    await page.goto("/seller");

    await expect(page).toHaveURL(/\/login/);
  });

  test("이벤트 상세 HTML에 이벤트명 og:title이 들어간다", async ({ page }) => {
    await page.goto("/");

    const eventPath = await page.locator("a[href]").evaluateAll(
      (links, pattern) =>
        links
          .map((link) => link.getAttribute("href"))
          .find((href): href is string => !!href && new RegExp(pattern).test(href)) ??
        null,
      eventPathPattern.source,
    );

    if (!eventPath) {
      test.skip(true, "홈에 노출된 이벤트가 없어서 상세 메타 검증을 건너뜁니다.");
      return;
    }

    await page.goto(eventPath);
    const title = (await page.locator("h1").first().textContent())?.trim();
    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");

    expect(title).toBeTruthy();
    expect(ogTitle).toBe(title);
  });
});
