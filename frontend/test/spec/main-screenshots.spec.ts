import { test, expect } from "@playwright/test";
import "../config/test.utils";

test("main: instances page screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator('input[placeholder="Filter Instances"]')).toBeVisible();
});

test("main: communities page screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/communities", { waitUntil: "networkidle" });
  await expect(page.locator('input[placeholder="Filter Communities"]')).toBeVisible();
});

test("main: instance view overview lemmy.world", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto("/instance/lemmy.world", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/instance\/lemmy\.world/);
});

test("main: instance view stats lemmy.world", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto("/instance/lemmy.world/user-growth", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/instance\/lemmy\.world\/user-growth/);
});
