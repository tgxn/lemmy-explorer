import type { FullConfig } from "@playwright/test";

import path from "node:path";
import fs from "node:fs";

async function globalSetup(config: FullConfig) {
  // delete previous Playwright outputs

  const folderPath = path.join("./output");
  if (fs.existsSync(folderPath)) {
    fs.rm(folderPath, { recursive: true, force: true }, (error) => {
      if (error) {
        console.error(`Error deleting ${"./output"}`, error);
      }
    });
    console.log(`Deleted folder: ${"./output"}`);
  }
}

export default globalSetup;
