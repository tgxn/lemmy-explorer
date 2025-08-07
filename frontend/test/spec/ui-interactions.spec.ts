import { test, expect } from "../config/test.utils";

// Test critical UI interactions such as toggling color scheme

const getColorScheme = async (page) => {
  return await page.evaluate(() => document.documentElement.getAttribute("data-joy-color-scheme"));
};

test("toggle color scheme", async ({ page }) => {
  await page.goto("/", {
    waitUntil: "networkidle",
  });

  const initial = await getColorScheme(page);
  await page.locator("#toggle-mode").first().click();
  const toggled = await getColorScheme(page);
  expect(toggled).not.toBe(initial);
});
