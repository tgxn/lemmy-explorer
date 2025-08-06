import { test, expect } from "@playwright/test";
import "../config/test.utils";

test("main: instances page", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator('input[placeholder="Filter Instances"]')).toBeVisible();
});

test("main: communities page", async ({ page }) => {
  await page.goto("/communities", { waitUntil: "networkidle" });
  await expect(page.locator('input[placeholder="Filter Communities"]')).toBeVisible();
});

test("main: lemmy.world overview", async ({ page }) => {
  await page.goto("/instance/lemmy.world", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/instance\/lemmy.world$/);
});

test("main: lemmy.world user growth", async ({ page }) => {
  await page.goto("/instance/lemmy.world/user-growth", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/instance\/lemmy.world\/user-growth$/);
});
