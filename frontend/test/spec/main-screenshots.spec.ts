import { test, expect } from "../config/test.utils";

test("main: (1080p) instances page screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator('input[placeholder="Filter Instances"]')).toBeVisible();
});

test("main: (1080p) communities page screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/communities", { waitUntil: "networkidle" });
  await expect(page.locator('input[placeholder="Filter Communities"]')).toBeVisible();
});

test("main: (mobile) instances page screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 454, height: 917 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator('input[placeholder="Filter Instances"]')).toBeVisible();
});

test("main: (mobile) communities page screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 454, height: 917 });
  await page.goto("/communities", { waitUntil: "networkidle" });
  await expect(page.locator('input[placeholder="Filter Communities"]')).toBeVisible();
});

test("main: instance view overview lemmy.world", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/instance/lemmy.world", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/instance\/lemmy\.world/);
});

test("main: instance view stats lemmy.world", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/instance/lemmy.world/user-growth", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/instance\/lemmy\.world\/user-growth/);
});
