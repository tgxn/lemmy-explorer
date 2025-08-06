import { test, expect } from "@playwright/test";
import "../config/test.utils";

// Test critical UI interactions such as toggling color scheme

const getColorScheme = async (page) => {
  return await page.evaluate(() => document.documentElement.getAttribute("data-joy-color-scheme"));
};

test.describe("ui interactions", () => {
  test("toggle color scheme", async ({ page }) => {
    await page.goto("/", {
      waitUntil: "networkidle",
    });

    const initial = await getColorScheme(page);
    await page.locator("#toggle-mode").first().click();
    const toggled = await getColorScheme(page);
    expect(toggled).not.toBe(initial);
  });
});

// verify that toggling dark mode updates the color scheme
test("toggle color scheme", async ({ page }) => {
  await page.goto("/", {
    waitUntil: "networkidle",
  });

  const root = page.locator("html");
  const before = await root.getAttribute("data-joy-color-scheme");
  const toggle = page.locator("#toggle-mode");
  await toggle.click();
  const after = await root.getAttribute("data-joy-color-scheme");
  expect(after).not.toBe(before);
});
