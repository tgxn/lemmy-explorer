import type { FullConfig } from "@playwright/test";

import path from "node:path";
import fs from "node:fs";

async function globalSetup(config: FullConfig) {
  // delete screeshots
  const screenshotsFolder = path.join("./output/screens");
  if (fs.existsSync(screenshotsFolder)) {
    fs.rm(screenshotsFolder, { recursive: true, force: true }, (error) => {
      if (error) {
        console.error("Error deleting screenshots", error);
      }
    });
  }
}

export default globalSetup;
