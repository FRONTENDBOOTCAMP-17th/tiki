import { test } from "@playwright/test";
const SHOT = "../images";
test("Spinner 예제", async ({ page }) => {
  await page.goto("/example/spinner");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOT}/2nd-03-spinner.png`, fullPage: true });
});
