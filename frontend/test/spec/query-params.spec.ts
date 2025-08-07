import { test, expect } from "@playwright/test";
import { setupGlobalHooks } from "../config/test.utils";
setupGlobalHooks();

test("should remain unchanged on initial load with params", async ({ page }) => {
  const path = "/?query=foo&order=users&open=true";

  await page.goto(path, {
    waitUntil: "networkidle",
  });

  // wait for potential effect that updates search params
  await page.waitForTimeout(600);

  const url = new URL(page.url());
  expect(url.pathname + url.search).toBe(path);
});

test("should not add params when none are provided", async ({ page }) => {
  await page.goto("/", {
    waitUntil: "networkidle",
  });

  await page.waitForTimeout(600);
  const url = new URL(page.url());
  expect(url.pathname + url.search).toBe("/");
});
