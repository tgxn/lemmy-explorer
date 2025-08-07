import { test as base } from "@playwright/test";

export const test = base;
export const expect = test.expect;

// Save a screenshot after each test in a flat directory with a stable name.
// Screenshots contain the test name and are saved in the `output/screens` directory.
test.afterEach(async ({ page }, testInfo) => {
  const testName = testInfo.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

  const path = `output/screens/${testName}.png`;

  // wait 1000 ms to ensure the page is fully rendered
  await page.waitForTimeout(7500);

  await page.screenshot({ path });
  console.log("Screenshot saved to", path);
});
