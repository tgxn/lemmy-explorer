import { test, expect } from "@playwright/test";

import { takeScreenshot } from "./test.utils";

test("Page Loads", async ({ context }) => {
  const hostPage = await context.newPage();

  await takeScreenshot(hostPage, "game-over");
});
