import { test, expect } from "@playwright/test";

// Helper to check local storage
async function getStorage(page) {
  const raw = await page.evaluate(() => localStorage.getItem("explorer_storage"));
  return raw ? JSON.parse(raw) : {};
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("navigate between Instances and Communities", async ({ page }) => {
  // instances is default page
  await expect(page.locator('input[placeholder="Filter Instances"]')).toBeVisible();

  await page.getByRole("tab", { name: "Communities" }).click();
  await expect(page.locator('input[placeholder="Filter Communities"]')).toBeVisible();
});

test("switch instance view type", async ({ page }) => {
  await expect(page.locator('input[placeholder="Filter Instances"]')).toBeVisible();
  await page.getByRole("button", { name: "List View" }).click();
  await expect.poll(async () => (await getStorage(page))["instance.viewType"]).toBe("list");
});

test("navigate between main pages", async ({ page }) => {
  await page.goto("/");
  // Instances tab is default
  await expect(page).toHaveURL(/\/$/);

  // Click Communities tab
  await page.getByRole("tab", { name: /Communities/i }).click();
  await expect(page).toHaveURL(/\/communities$/);

  // Navigate back to instances
  await page.getByRole("tab", { name: /Instances/i }).click();
  await expect(page).toHaveURL(/\/$/);
});
