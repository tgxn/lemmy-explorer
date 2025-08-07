import { test as base } from "@playwright/test";

export const test = base;
export const expect = test.expect;

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
  await page.waitForTimeout(500);

  await page.screenshot({ path });
  console.log("Screenshot saved to", path);
});
