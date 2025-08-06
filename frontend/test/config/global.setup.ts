import type { FullConfig } from "@playwright/test";

import path from "node:path";
import fs from "node:fs";

async function globalSetup(config: FullConfig) {
  // delete previous Playwright outputs
  const folders = ["./output/screens", "./output/results"];
  for (const folder of folders) {
    const folderPath = path.join(folder);
    if (fs.existsSync(folderPath)) {
      fs.rm(folderPath, { recursive: true, force: true }, (error) => {
        if (error) {
          console.error(`Error deleting ${folder}`, error);
        }
      });
    }
  }
}

export default globalSetup;
