import { test } from "@playwright/test";
const SHOT = "../images";
test.use({ viewport: { width: 390, height: 844 } });
test("Navigation 예제(모바일 390px)", async ({ page }) => {
  await page.goto("/example/navigation");
  await page.screenshot({ path: `${SHOT}/2nd-02-navigation-mobile.png`, fullPage: true });
});
