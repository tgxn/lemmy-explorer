import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: "./test",
  testMatch: ["**/*.spec.ts"],
  testIgnore: ["**/*.test.ts"],

  outputDir: "./output/results",

  // Run all tests in parallel.
  fullyParallel: true,

  // path to the global setup files.
  globalSetup: require.resolve("./test/config/global.setup.ts"),

  //   // path to the global teardown files.
  //   globalTeardown: require.resolve("./global-teardown"),

  // Each test is given 30 seconds.
  timeout: 30000,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [["list"], ["html", { outputFolder: "./output/report" }]],

  // Configure projects for major browsers.
  projects: [
    {
      name: "chromium",
      use: {
        permissions: ["clipboard-read", "clipboard-write"],
        ...devices["Desktop Chrome"],
      },
    },
  ],
  // Run your local dev server before starting the tests
  webServer: [
    {
      command: "yarn run start:test",
      url: "http://127.0.0.1:9191",
      timeout: 120 * 1000,
      reuseExistingServer: true,
      stdout: "ignore",
      stderr: "pipe",
    },
  ],

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: "http://127.0.0.1:9191",
    screenshot: "on",

    // Collect trace when retrying the failed test.
    // trace: "on-first-retry",
  },
});
