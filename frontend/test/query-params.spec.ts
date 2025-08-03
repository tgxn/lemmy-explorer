import { test, expect } from "@playwright/test";

test.describe("instances query parameters", () => {
  test("should remain unchanged on initial load with params", async ({ page }) => {
    const path = "/?query=foo&order=users&open=true";
    await page.goto(path);
    // wait for potential effect that updates search params
    await page.waitForTimeout(600);
    const url = new URL(page.url());
    expect(url.pathname + url.search).toBe(path);
  });

  test("should not add params when none are provided", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(600);
    const url = new URL(page.url());
    expect(url.pathname + url.search).toBe("/");
  });
});
