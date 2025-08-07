import { test } from "@playwright/test";

export function setupGlobalHooks() {
  // Save a screenshot after each test in a flat directory with a stable name.
  // Screenshots contain the test name and are saved in the `output/screens` directory.
  test.afterEach(async ({ page }, testInfo) => {
    const testName = testInfo.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const path = `output/screens/${testName}.png`;

    // to ensure the page is fully rendered
    await Promise.all([
      page.waitForLoadState("networkidle"),
      page.waitForFunction(() => document.readyState === "complete"),
    ]);

    // them wait 10 seconds
    await page.waitForTimeout(10000);

    await page.screenshot({ path });
    console.log("📸 Screenshot saved:", path);
  });
}
