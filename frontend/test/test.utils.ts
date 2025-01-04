import { test } from "@playwright/test";

let indexNum = 0;
export async function takeScreenshot(page: any, name: string) {
  await test.step("takeScreenshot", async () => {
    const path = `./output/screens/${indexNum}-${name}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log("Screenshot saved to", path);
    indexNum++;
  });
}
